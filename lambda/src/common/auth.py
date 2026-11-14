"""JWT authentication for Lambda handlers.

Verifies a Supabase Auth access token (ES256 / RS256) against the project's public JWKS
endpoint. No secret is needed. The tenant (account_id) MUST come from the verified
token's `sub` claim, never from a client-supplied header, query string or body field.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
import urllib.error
import urllib.request

import jwt

from . import http

ALLOWED_ALGORITHMS = ["ES256", "RS256"]  # asymmetric only: blocks HS256 / "none" confusion attacks
JWKS_TTL_SECONDS = 600
JWKS_MIN_REFETCH_SECONDS = 30  # an unknown `kid` can force at most one refetch per this window

_lock = threading.Lock()
_cache: dict = {"base": None, "keys": {}, "fetched_at": 0.0}


class JwksUnavailable(Exception):
    """The Supabase key endpoint could not be reached (temporary)."""


def _fetch_jwks(base: str) -> dict:
    req = urllib.request.Request(
        f"{base}/auth/v1/.well-known/jwks.json", headers={"User-Agent": "pixeva-crm-lambda"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:  # noqa: S310 (URL comes from config)
            document = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
        raise JwksUnavailable(str(exc)) from exc
    keys = {}
    for jwk in document.get("keys", []):
        kid = jwk.get("kid")
        if kid:
            keys[kid] = jwt.PyJWK.from_dict(jwk)
    return keys


def _get_signing_key(base: str, kid: str | None):
    if not kid:
        raise jwt.InvalidTokenError("Token has no key id")
    with _lock:
        now = time.time()
        if _cache["base"] != base:
            _cache.update(base=base, keys={}, fetched_at=0.0)
        age = now - _cache["fetched_at"]
        stale = age > JWKS_TTL_SECONDS
        unknown_kid = kid not in _cache["keys"] and age > JWKS_MIN_REFETCH_SECONDS
        if stale or unknown_kid:
            try:
                _cache.update(keys=_fetch_jwks(base), fetched_at=now)
            except JwksUnavailable:
                if kid not in _cache["keys"]:
                    raise
                # keep serving from the previous key set while the endpoint is down
        key = _cache["keys"].get(kid)
    if key is None:
        raise jwt.InvalidTokenError("Unknown signing key")
    return key


def get_bearer_token(event: dict) -> str | None:
    value = http.get_header(event, "authorization")
    if not value or not isinstance(value, str):
        return None
    match = re.match(r"^Bearer\s+(.+)$", value.strip(), re.IGNORECASE)
    return match.group(1) if match else None


def authenticate(event: dict) -> dict:
    """Return {"ok": True, "user_id": str} or {"ok": False, "status": int, "error": str}."""
    token = get_bearer_token(event)
    if not token:
        return {"ok": False, "status": 401, "error": "Authentication required"}

    base = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    if not base or "your-supabase-project" in base:
        return {"ok": False, "status": 500, "error": "Authentication is not configured"}

    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") not in ALLOWED_ALGORITHMS:
            return {"ok": False, "status": 401, "error": "Invalid or expired token"}
        signing_key = _get_signing_key(base, header.get("kid"))
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALLOWED_ALGORITHMS,
            audience="authenticated",
            issuer=f"{base}/auth/v1",
            leeway=5,
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except JwksUnavailable:
        print("[auth] Supabase JWKS endpoint unavailable")
        return {"ok": False, "status": 503, "error": "Authentication service unavailable"}
    except jwt.PyJWTError:
        return {"ok": False, "status": 401, "error": "Invalid or expired token"}

    sub = claims.get("sub")
    if not isinstance(sub, str) or not sub:
        return {"ok": False, "status": 401, "error": "Invalid token"}
    return {"ok": True, "user_id": sub}


def auth_failure(result: dict) -> dict:
    return http.respond(result["status"], {"success": False, "error": result["error"]})
