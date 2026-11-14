"""HTTP / API Gateway (payload v2.0) helpers shared by every Lambda handler."""

from __future__ import annotations

import base64
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import parse_qs

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
}

# Fields a client must never be able to set when updating a record.
PROTECTED_FIELDS = ("id", "account_id", "created_at")


# Request bodies in this API are small JSON documents; anything larger is abuse or a bug.
MAX_BODY_BYTES = 256 * 1024


class BadRequest(Exception):
    """Raised for malformed client input (becomes a 400 response)."""

    status = 400


class PayloadTooLarge(BadRequest):
    status = 413


def respond(status: int, body: Any = None, headers: dict | None = None) -> dict:
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, **(headers or {})},
        "body": "" if body is None else json.dumps(body, default=str),
    }


def now_ms() -> int:
    return int(time.time() * 1000)


def iso_now() -> str:
    return iso_ago()


def iso_ago(days: float = 0, hours: float = 0) -> str:
    """UTC timestamp in the same shape JavaScript's toISOString() produced."""
    moment = datetime.now(timezone.utc) - timedelta(days=days, hours=hours)
    return moment.strftime("%Y-%m-%dT%H:%M:%S.") + f"{moment.microsecond // 1000:03d}Z"


def http_method(event: dict) -> str:
    method = ((event.get("requestContext") or {}).get("http") or {}).get("method") or event.get("httpMethod")
    return str(method or "GET").upper()


def get_header(event: dict, name: str) -> str | None:
    wanted = name.lower()
    for key, value in (event.get("headers") or {}).items():
        if str(key).lower() == wanted:
            return value
    return None


def parse_json_body(event: dict) -> dict:
    """Return the JSON request body as a dict ({} when there is none)."""
    raw = event.get("body")
    if raw is None or raw == "":
        return {}
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str) and len(raw) > MAX_BODY_BYTES:
        raise PayloadTooLarge("Request body is too large")
    if event.get("isBase64Encoded"):
        try:
            raw = base64.b64decode(raw).decode("utf-8")
        except (ValueError, UnicodeDecodeError) as exc:
            raise BadRequest("Invalid request body encoding") from exc
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError) as exc:
        raise BadRequest("Request body must be valid JSON") from exc
    if not isinstance(parsed, dict):
        raise BadRequest("Request body must be a JSON object")
    return parsed


def query_params(event: dict) -> dict[str, str]:
    raw = event.get("rawQueryString")
    if raw:
        return {k: v[0] for k, v in parse_qs(raw, keep_blank_values=True).items()}
    return {k: str(v) for k, v in (event.get("queryStringParameters") or {}).items()}


def to_number(value: Any) -> int | float:
    """Mirror JavaScript's `Number(x) || 0`."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0
    if number != number:  # NaN
        return 0
    return int(number) if number.is_integer() else number


def clamp_strings(data: dict, max_len: int = 1000) -> dict:
    return {k: (v[:max_len] if isinstance(v, str) else v) for k, v in data.items()}


def strip_protected(data: dict) -> dict:
    """Drop fields a client may not write (prevents re-assigning a row to another tenant)."""
    return {k: v for k, v in data.items() if k not in PROTECTED_FIELDS}
