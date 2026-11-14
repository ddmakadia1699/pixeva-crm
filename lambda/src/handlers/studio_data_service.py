"""Studio data microservice: galleries, client requests, finances and dashboard metrics.

One function serves /galleries, /client-requests, /finances, /dashboard and /studio-data;
the resource is chosen from the request path (or a `resource` field in the body).
"""

from __future__ import annotations

from common import auth, http
from common.db import DbError, db_table

SERVICE = "studio-data-service"
DEFAULT_COVER = "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60"
ROUTING_FIELDS = ("resource", "action")


def _ok(account_id: str, started: int, **extra) -> dict:
    return http.respond(
        200,
        {"success": True, "accountId": account_id, **extra, "executionTimeMs": http.now_ms() - started},
    )


def _resource(raw_path: str, body: dict) -> str:
    if "client-request" in raw_path or body.get("resource") == "client-requests":
        return "client-requests"
    if "finance" in raw_path or body.get("resource") == "finances":
        return "finances"
    if "dashboard" in raw_path or body.get("resource") == "dashboard":
        return "dashboard"
    return "galleries"


def _list(table: str, account_id: str) -> list[dict]:
    try:
        return (
            db_table(table).select("*").eq("account_id", account_id).order("created_at", desc=True).execute()
        )
    except DbError:
        return []


def _dashboard(account_id: str) -> dict:
    enquiries = {"new": 0, "followUp": 0, "booked": 0, "total": 0}
    active_projects = 0

    try:
        leads = db_table("leads").select("status").eq("account_id", account_id).execute()
        if leads:
            enquiries = {
                "new": sum(1 for lead in leads if lead.get("status") == "new" or not lead.get("status")),
                "followUp": sum(1 for lead in leads if lead.get("status") in ("contacted", "qualified", "proposal")),
                "booked": sum(1 for lead in leads if lead.get("status") == "booked"),
                "total": len(leads),
            }
    except DbError:
        pass

    try:
        projects = db_table("bookings").select("id").eq("account_id", account_id).execute()
        active_projects = len(projects)
    except DbError:
        pass

    return {
        "enquiriesNew": enquiries["new"],
        "enquiriesFollowUp": enquiries["followUp"],
        "enquiriesBooked": enquiries["booked"],
        "totalEnquiries": enquiries["total"],
        "activeProjectsCount": active_projects,
        "totalRevenue": 0,
        "receivedRevenue": 0,
        "pendingRevenue": 0,
        "postProdInProgress": 0,
        "postProdReview": 0,
        "postProdReady": 0,
        "clientRequestsPending": 0,
    }


def handler(event, context=None):
    started = http.now_ms()
    method = http.http_method(event)
    if method == "OPTIONS":
        return http.respond(200)

    try:
        body = http.parse_json_body(event)
    except http.BadRequest as exc:
        return http.respond(400, {"success": False, "error": str(exc)})

    # Tenant comes ONLY from the verified Supabase JWT, never from client-supplied fields.
    result = auth.authenticate(event)
    if not result["ok"]:
        return auth.auth_failure(result)
    account_id = result["user_id"]

    resource = _resource(str(event.get("rawPath") or event.get("path") or ""), body)
    action = {"POST": "CREATE", "PUT": "UPDATE", "DELETE": "DELETE"}.get(method, body.get("action") or "GET")

    try:
        if resource == "galleries":
            if action == "GET":
                return _ok(account_id, started, data=_list("galleries", account_id))
            if action == "CREATE":
                item = {
                    "account_id": account_id,
                    "title": body.get("title") or "New Gallery",
                    "event_date": body.get("event_date") or http.iso_now().split("T")[0],
                    "photo_count": body.get("photo_count") or 0,
                    "guest_selfie_count": 0,
                    "qr_code_url": body.get("qr_code_url") or f"https://pixeva.co/g/{http.now_ms()}",
                    "cover_image_url": body.get("cover_image") or body.get("cover_image_url") or DEFAULT_COVER,
                }
                try:
                    rows = db_table("galleries").insert([item]).execute()
                    created = rows[0] if rows else item
                except DbError:
                    created = {"id": f"g-{http.now_ms()}", **item, "created_at": http.iso_now()}
                return _ok(account_id, started, data=created)

        elif resource == "client-requests":
            if action == "GET":
                return _ok(account_id, started, data=_list("client_requests", account_id))
            if action == "CREATE":
                item = {
                    "account_id": account_id,
                    "project_name": body.get("project_name") or body.get("project") or "Project",
                    "category": body.get("category") or "General",
                    "details": body.get("details") or "",
                    "assign_team": body.get("assign_team") or None,
                    "status": body.get("status") or "Pending",
                }
                try:
                    rows = db_table("client_requests").insert([item]).execute()
                    created = rows[0] if rows else item
                except DbError:
                    created = {"id": f"req-{http.now_ms()}", **item, "created_at": http.iso_now()}
                return _ok(account_id, started, data=created)
            if action == "UPDATE":
                record_id = body.get("id")
                updates = {
                    k: v for k, v in http.strip_protected(body).items() if k not in ROUTING_FIELDS
                }  # never let a client re-assign account_id
                try:
                    db_table("client_requests").update(updates).eq("id", record_id).eq(
                        "account_id", account_id
                    ).execute()
                except DbError:
                    pass
                return _ok(account_id, started, data={"id": record_id, **updates})

        elif resource == "finances":
            return _ok(
                account_id,
                started,
                data={"totalRevenue": 0, "receivedRevenue": 0, "pendingRevenue": 0, "projectFinances": []},
            )

        elif resource == "dashboard":
            return _ok(account_id, started, data=_dashboard(account_id))

        return http.respond(200, {"success": True, "accountId": account_id, "message": "Studio data service online"})

    except Exception as exc:  # noqa: BLE001 (last-resort guard for the Lambda boundary)
        print(f"[{SERVICE}] Unhandled error: {exc!r}")
        return http.respond(500, {"success": False, "error": "Internal server error"})
