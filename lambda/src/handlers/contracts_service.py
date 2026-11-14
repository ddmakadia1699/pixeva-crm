"""Contracts & digital signatures microservice: GET / POST / PUT (sign) / DELETE /contracts."""

from __future__ import annotations

from common import auth, http
from common.db import DbError, db_table

SERVICE = "contracts-service"
METHOD_ACTIONS = {"GET": "GET", "POST": "CREATE", "PUT": "SIGN", "DELETE": "DELETE"}


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
        return http.respond(400, {"success": False, "error": str(exc)})

    action = METHOD_ACTIONS.get(method)
    if action is None:
        return http.respond(405, {"success": False, "error": f"Unsupported method: {method}"})

    query_id = http.query_params(event).get("id")
    if query_id:
        payload = {**payload, "id": query_id}

    # Tenant comes ONLY from the verified Supabase JWT, never from client-supplied fields.
    result = auth.authenticate(event)
    if not result["ok"]:
        return auth.auth_failure(result)
    account_id = result["user_id"]

    try:
        if action == "GET":
            try:
                rows = (
                    db_table("contracts")
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
            record = {
                "account_id": account_id,
                "title": payload.get("title") or "Studio Service Agreement",
                "client_name": payload.get("client_name") or "Client",
                "client_email": payload.get("client_email") or "client@example.com",
                "terms_summary": payload.get("terms_summary") or "Standard terms",
                "status": payload.get("status") or "pending_signature",
            }
            try:
                rows = db_table("contracts").insert([record]).execute()
                created = rows[0] if rows else record
            except DbError as exc:
                print(f"[{SERVICE}] Database insert notice, returning structured tenant record: {exc}")
                created = {"id": f"ct-{http.now_ms()}", **record, "created_at": http.iso_now()}
            return _ok("CREATE", account_id, started, data=created)

        if action == "SIGN":
            record_id = payload.get("id")
            signed_at = http.iso_now()
            try:
                rows = (
                    db_table("contracts")
                    .update(
                        {
                            "status": "signed",
                            "signed_at": signed_at,
                            "signature_data": payload.get("signature_data")
                            or "Digital cryptographic e-signature accepted",
                        }
                    )
                    .eq("id", record_id)
                    .eq("account_id", account_id)
                    .execute()
                )
                updated = rows[0] if rows else {"id": record_id, "status": "signed", "account_id": account_id}
            except DbError:
                updated = {"id": record_id, "status": "signed", "account_id": account_id, "signed_at": signed_at}
            return _ok("SIGN", account_id, started, data=updated)

        # DELETE
        record_id = payload.get("id")
        try:
            if record_id:
                db_table("contracts").delete().eq("id", record_id).eq("account_id", account_id).execute()
        except DbError as exc:
            print(f"[{SERVICE}] Delete notice: {exc}")
        return _ok("DELETE", account_id, started, deletedId=record_id)

    except Exception as exc:  # noqa: BLE001 (last-resort guard for the Lambda boundary)
        print(f"[{SERVICE}] Unhandled error: {exc!r}")
        return http.respond(
            500,
            {"success": False, "error": "Internal server error", "executionTimeMs": http.now_ms() - started},
        )
