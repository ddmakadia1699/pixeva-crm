"""Per-identity rate limiting (fixed-window counters).

Layered with API Gateway throttling: the gateway protects the whole API from floods, while
this module gives every *identity* (logged-in user, or client IP for the public form) its own
budget, so one noisy caller cannot use up everyone else's capacity.

Storage: DynamoDB in production (shared by every Lambda container, items expire via TTL),
in-memory for local development and tests (when RATE_LIMIT_TABLE is not set).

Failure policy: if the counter store is unavailable we ALLOW the request and log it
(availability over strictness); API Gateway throttling remains the backstop.
Known trade-off: fixed windows allow up to 2x the limit across a window boundary.
"""

from __future__ import annotations

import hashlib
import json
import os
import threading
import time
from dataclasses import dataclass

from . import http


@dataclass(frozen=True)
class Rule:
    name: str
    limit: int
    window_seconds: int


# Order each list shortest window first. Budgets are per identity.
POLICIES: dict[str, tuple[Rule, ...]] = {
    "read": (Rule("1m", 240, 60),),                                  # logged-in user, GET
    "write": (Rule("1m", 60, 60),),                                  # logged-in user, POST/PUT/DELETE
    "worker": (Rule("1m", 10, 60), Rule("1h", 100, 3600)),           # expensive: PDF / bulk email
    "public_ip": (Rule("1m", 5, 60), Rule("1h", 30, 3600)),          # public enquiry form, per client IP
    "public_studio": (Rule("1h", 60, 3600),),                        # public enquiry form, per studio
}


@dataclass(frozen=True)
class Decision:
    allowed: bool
    retry_after: int = 0
    rule: str = ""


class MemoryBackend:
    """Process-local counters. Only for local development and tests."""

    def __init__(self):
        self._counts: dict[str, tuple[int, int]] = {}
        self._lock = threading.Lock()

    def hit(self, key: str, expires_at: int) -> int:
        now = int(time.time())
        with self._lock:
            if len(self._counts) > 10_000:
                self._counts = {k: v for k, v in self._counts.items() if v[1] > now}
            count = self._counts.get(key, (0, expires_at))[0] + 1
            self._counts[key] = (count, expires_at)
            return count


class DynamoBackend:
    """Atomic counters in DynamoDB; items carry an `expires_at` TTL attribute."""

    def __init__(self, table: str, client=None):
        self._table = table
        self._client = client

    def _get_client(self):
        if self._client is None:
            import boto3  # provided by the Lambda runtime

            self._client = boto3.client("dynamodb")
        return self._client

    def hit(self, key: str, expires_at: int) -> int:
        response = self._get_client().update_item(
            TableName=self._table,
            Key={"pk": {"S": key}},
            UpdateExpression="ADD hits :one SET expires_at = :exp",
            ExpressionAttributeValues={":one": {"N": "1"}, ":exp": {"N": str(expires_at)}},
            ReturnValues="UPDATED_NEW",
        )
        return int(response["Attributes"]["hits"]["N"])


_backend = None
_backend_lock = threading.Lock()


def get_backend():
    global _backend
    with _backend_lock:
        if _backend is None:
            table = os.environ.get("RATE_LIMIT_TABLE")
            _backend = DynamoBackend(table) if table else MemoryBackend()
        return _backend


def set_backend(backend) -> None:
    """Swap the counter store (tests)."""
    global _backend
    with _backend_lock:
        _backend = backend


def _fingerprint(identity: str) -> str:
    # Hash so raw IPs / ids are never stored in the counter table.
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()[:32]


def check(policy: str, identity: str, now: float | None = None) -> Decision:
    moment = int(now if now is not None else time.time())
    backend = get_backend()
    who = _fingerprint(identity)
    for rule in POLICIES[policy]:
        window_start = moment - (moment % rule.window_seconds)
        window_end = window_start + rule.window_seconds
        key = f"{policy}#{rule.name}#{who}#{window_start}"
        try:
            count = backend.hit(key, window_end + 60)
        except Exception as exc:  # noqa: BLE001 (fail open; see module docstring)
            print(json.dumps({"event": "rate_limit_store_error", "policy": policy, "error": repr(exc)}))
            return Decision(True)
        if count > rule.limit:
            return Decision(False, max(1, window_end - moment), f"{policy}:{rule.name}")
    return Decision(True)


def client_ip(event: dict) -> str:
    """The caller's IP as seen by API Gateway (not spoofable via X-Forwarded-For)."""
    source = ((event.get("requestContext") or {}).get("http") or {}).get("sourceIp")
    return str(source or "unknown")


def guard(policy: str, identity: str) -> dict | None:
    """Return a 429 response when the identity is over budget, else None."""
    decision = check(policy, identity)
    if decision.allowed:
        return None
    print(json.dumps({"event": "rate_limited", "rule": decision.rule, "retryAfter": decision.retry_after}))
    return http.respond(
        429,
        {
            "success": False,
            "error": "Too many requests. Please slow down and try again shortly.",
            "retryAfterSeconds": decision.retry_after,
        },
        headers={"Retry-After": str(decision.retry_after)},
    )
