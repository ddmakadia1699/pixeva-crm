"""Minimal Supabase (PostgREST) client built on the standard library.

Avoids the heavy supabase SDK so the Lambda package stays small and has no compiled
dependencies beyond PyJWT. Every query a handler makes must include an explicit
`account_id` filter; the account id always comes from the verified JWT.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


class DbError(Exception):
    def __init__(self, message: str, code: str | None = None, status: int | None = None):
        super().__init__(message)
        self.code = code
        self.status = status


def _configured(url: str, key: str) -> bool:
    return bool(url and key and "your-supabase-project" not in url and not key.startswith("dummy"))


class Query:
    def __init__(self, client: "Supabase", table: str):
        self._client = client
        self._table = table
        self._method = "GET"
        self._params: list[tuple[str, str]] = [("select", "*")]
        self._body: Any = None

    # --- verbs -------------------------------------------------------------
    def select(self, columns: str = "*") -> "Query":
        self._method = "GET"
        self._params = [("select", columns)]
        return self

    def insert(self, rows: list[dict]) -> "Query":
        self._method = "POST"
        self._params = []
        self._body = rows
        return self

    def update(self, values: dict) -> "Query":
        self._method = "PATCH"
        self._params = []
        self._body = values
        return self

    def delete(self) -> "Query":
        self._method = "DELETE"
        self._params = []
        return self

    # --- filters -----------------------------------------------------------
    def eq(self, column: str, value: Any) -> "Query":
        self._params.append((column, f"eq.{value}"))
        return self

    def in_(self, column: str, values: list[Any]) -> "Query":
        quoted = ",".join('"' + str(v).replace("\\", "\\\\").replace('"', '\\"') + '"' for v in values)
        self._params.append((column, f"in.({quoted})"))
        return self

    def order(self, column: str, desc: bool = False) -> "Query":
        self._params.append(("order", f"{column}.{'desc' if desc else 'asc'}"))
        return self

    def execute(self) -> list[dict]:
        prefer = "return=minimal" if self._method == "DELETE" else "return=representation"
        return self._client.request(self._method, self._table, self._params, self._body, prefer)


class Supabase:
    def __init__(self, url: str, key: str, timeout: float = 10.0):
        self._url = url.rstrip("/")
        self._key = key
        self._timeout = timeout

    def table(self, name: str) -> Query:
        return Query(self, name)

    def request(self, method: str, table: str, params: list[tuple[str, str]], body: Any, prefer: str) -> list[dict]:
        query = urllib.parse.urlencode(params, quote_via=urllib.parse.quote, safe="")
        url = f"{self._url}/rest/v1/{urllib.parse.quote(table, safe='')}" + (f"?{query}" if query else "")
        headers = {
            "apikey": self._key,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": prefer,
        }
        # Legacy keys are JWTs and are also sent as a bearer token. The newer opaque
        # `sb_secret_...` keys must only go in the `apikey` header.
        if self._key.startswith("eyJ"):
            headers["Authorization"] = f"Bearer {self._key}"

        data = None if body is None else json.dumps(body).encode("utf-8")
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:  # noqa: S310 (URL comes from config)
                raw = resp.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            detail: dict = {}
            try:
                detail = json.loads(exc.read().decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                pass
            finally:
                exc.close()
            raise DbError(detail.get("message") or f"HTTP {exc.code}", detail.get("code"), exc.code) from exc
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise DbError(f"Database unreachable: {exc}") from exc

        if not raw:
            return []
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else [parsed]


def get_db() -> Supabase | None:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""
    return Supabase(url, key) if _configured(url, key) else None


def db_table(name: str) -> Query:
    """Start a query, or raise DbError when Supabase is not configured."""
    db = get_db()
    if db is None:
        raise DbError("Supabase is not configured")
    return db.table(name)
