"""Enquiries (leads) microservice: GET / POST / PUT / DELETE /enquiries."""

from __future__ import annotations

from common import auth, http, ratelimit
from common.db import DbError, db_table

SERVICE = "enquiries-service"
METHOD_ACTIONS = {"GET": "GET", "POST": "CREATE", "PUT": "UPDATE", "DELETE": "DELETE"}


def sanitize_status(value) -> str:
    """Map free-text status onto the PostgreSQL CHECK constraint values."""
    lower = str(value or "").lower().strip()
    if "new" in lower:
        return "new"
    if "follow" in lower or "contact" in lower or "meeting" in lower:
        return "contacted"
    if "qualif" in lower or "book" in lower:
        return "qualified"
    if "propos" in lower:
        return "proposal"
    return "new"


def _ok(action: str, account_id: str, started: int, **extra) -> dict:
    return http.respond(
        200,
        {
            "success": True,
            "action": action,
            "accountId": account_id,
            **extra,
            "executionTimeMs": http.now_ms() - started,
        },
    )


def handler(event, context=None):
    started = http.now_ms()
    method = http.http_method(event)
    if method == "OPTIONS":
        return http.respond(200)

    try:
        payload = http.parse_json_body(event)
    except http.BadRequest as exc:
        return http.respond(exc.status, {"success": False, "error": str(exc)})

    action = METHOD_ACTIONS.get(method)
    if action is None:
        return http.respond(405, {"success": False, "error": f"Unsupported method: {method}"})

    query_id = http.query_params(event).get("id")
    if query_id:
        payload = {**payload, "id": query_id}

    # Tenant comes from the verified Supabase JWT. The only exception is the public
    # enquiry form: a create-only request with NO bearer token may target the studio id
    # it was given. An invalid token never falls back to this path.
    submitted_account = payload.get("account_id")
    is_public_create = (
        action == "CREATE"
        and not auth.get_bearer_token(event)
        and isinstance(submitted_account, str)
        and 0 < len(submitted_account.strip()) <= 128
    )
    if is_public_create:
        account_id = submitted_account.strip()
        payload = http.clamp_strings(payload)
        # Anonymous callers are limited per client IP and per target studio.
        limited = ratelimit.guard("public_ip", ratelimit.client_ip(event)) or ratelimit.guard(
            "public_studio", account_id
        )
    else:
        result = auth.authenticate(event)
        if not result["ok"]:
            return auth.auth_failure(result)
        account_id = result["user_id"]
        limited = ratelimit.guard("read" if action == "GET" else "write", account_id)
    if limited:
        return limited

    try:
        if action == "GET":
            try:
                rows = (
                    db_table("leads")
                    .select("*")
                    .eq("account_id", account_id)
                    .order("created_at", desc=True)
                    .execute()
                )
            except DbError as exc:
                print(f"[{SERVICE}] Supabase query error: {exc}")
                rows = []
            return _ok("GET", account_id, started, data=rows)

        if action == "CREATE":
            parts = str(payload.get("name") or "Client").strip().split(" ")
            first_name = parts[0] or "Client"
            last_name = " ".join(parts[1:]) or "Enquiry"
            email = str(payload.get("email") or "").strip() or f"{first_name.lower()}.{http.now_ms()}@client.com"
            record = {
                "account_id": account_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "phone": payload.get("phone") or "",
                "company": payload.get("event_name") or payload.get("company") or "Event",
                "status": sanitize_status(payload.get("status")),
                "estimated_value": payload.get("estimated_budget") or payload.get("estimated_value") or 0,
                "source": payload.get("source") or "Website",
                "notes": (
                    f"{payload.get('event_type') or ''} event on {payload.get('event_date') or ''}. "
                    f"{payload.get('notes') or ''}"
                ).strip(),
            }
            try:
                try:
                    rows = db_table("leads").insert([record]).execute()
                except DbError as exc:
                    if exc.code != "23505":  # unique violation (duplicate email): retry once
                        raise
                    retry = {**record, "email": f"{first_name.lower()}.{http.now_ms()}@client.com"}
                    rows = db_table("leads").insert([retry]).execute()
                created = rows[0] if rows else record
            except DbError as exc:
                print(f"[{SERVICE}] Database insert notice, returning structured tenant record: {exc}")
                created = {"id": f"enq-{http.now_ms()}", **record, "created_at": http.iso_now()}
            return _ok("CREATE", account_id, started, data=created)

        if action == "UPDATE":
            record_id = payload.get("id")
            status = sanitize_status(payload.get("status"))
            try:
                rows = (
                    db_table("leads")
                    .update({"status": status, "updated_at": http.iso_now()})
                    .eq("id", record_id)
                    .eq("account_id", account_id)
                    .execute()
                )
                updated = rows[0] if rows else {"id": record_id, "status": status, "account_id": account_id}
            except DbError:
                updated = {"id": record_id, "status": status, "account_id": account_id, "updated_at": http.iso_now()}
            return _ok("UPDATE", account_id, started, data=updated)

        # DELETE
        record_id = payload.get("id")
        try:
            if payload.get("clearAll"):
                db_table("leads").delete().eq("account_id", account_id).execute()
                return _ok("DELETE_ALL", account_id, started)
            ids = payload.get("ids")
            if isinstance(ids, list) and ids:
                db_table("leads").delete().in_("id", ids).eq("account_id", account_id).execute()
                return _ok("DELETE_BATCH", account_id, started)
            if record_id:
                db_table("leads").delete().eq("id", record_id).eq("account_id", account_id).execute()
        except DbError as exc:
            print(f"[{SERVICE}] Delete notice: {exc}")
        return _ok("DELETE", account_id, started, deletedId=record_id)

    except Exception as exc:  # noqa: BLE001 (last-resort guard for the Lambda boundary)
        print(f"[{SERVICE}] Unhandled error: {exc!r}")
        return http.respond(
            500,
            {"success": False, "error": "Internal server error", "executionTimeMs": http.now_ms() - started},
        )
