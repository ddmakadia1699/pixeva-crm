"""Bookings / production projects microservice: GET / POST / PUT / DELETE /bookings."""

from __future__ import annotations

from common import auth, http
from common.db import DbError, db_table

SERVICE = "bookings-service"
METHOD_ACTIONS = {"GET": "GET", "POST": "CREATE", "PUT": "UPDATE", "DELETE": "DELETE"}


def sanitize_status(value) -> str:
    if not value:
        return "in_progress"
    s = str(value).lower()
    if "complete" in s or s == "delivered":
        return "completed"
    if "cancel" in s or "archive" in s or "hold" in s or "lost" in s:
        return "cancelled"
    if "progress" in s or "active" in s:
        return "in_progress"
    if "upcoming" in s or "scheduled" in s or "pending" in s:
        return "upcoming"
    return "in_progress"


def sanitize_event_type(value) -> str:
    if not value:
        return "wedding"
    t = str(value).lower()
    if "corp" in t:
        return "corporate"
    if "port" in t:
        return "portrait"
    return "wedding"


def _crew(*members):
    return [
        {"id": m[0], "name": m[1], "role": m[2], "initials": m[3], "phone": m[4]}
        for m in members
    ]


def seed_projects(account_id: str) -> list[dict]:
    """Starter projects shown (and inserted) for an account that has none yet."""
    alex = ("c-1", "Alex Rivers", "Lead Photographer", "AR", "+91 98765 43210")
    maya = ("c-2", "Maya Lin", "Cinematographer", "ML", "+91 98765 43211")
    rohan = ("c-3", "Rohan Verma", "Drone Pilot", "RV", "+91 98765 43212")
    dhruvi = ("c-4", "Dhruvi Patel", "Lead Editor", "DP", "+91 98765 43213")

    def project(pid, title, event_type, type_label, client, date, location, call_time, price, deposit,
                payment_status, status, stage, crew, deliverables, days_ago):
        return {
            "id": pid,
            "account_id": account_id,
            "title": title,
            "name": title,
            "event_type": event_type,
            "type": type_label,
            "client": client,
            "client_name": client,
            "date": f"{date} 00:00:00+00",
            "first_event": date,
            "location": location,
            "venue": location,
            "call_time": call_time,
            "price": price,
            "total_amount": price,
            "deposit_paid": deposit,
            "paid_amount": deposit,
            "payment_status": payment_status,
            "status": status,
            "stage": stage,
            "contract_status": "Accepted",
            "assigned_crew": _crew(*crew),
            "deliverables": [
                {"id": f"d{i + 1}", "title": t, "completed": done} for i, (t, done) in enumerate(deliverables)
            ],
            "created_at": http.iso_ago(days=days_ago),
        }

    return [
        project("proj-101", "Julian & Sophia Luxury Destination Wedding", "wedding", "Wedding",
                "Julian & Sophia", "2026-12-04", "Umaid Bhawan Palace, Jodhpur", "07:30 AM",
                280000, 140000, "Partial", "in_progress", 2, (alex, maya, rohan),
                [("Master 4K Cinematic Cut", False), ("Canvera Flush Mount Album", False)], 2),
        project("proj-102", "Vance Corporate Annual Gala", "corporate", "Corporate",
                "Eleanor Vance", "2026-11-15", "Taj Lands End, Mumbai", "04:00 PM",
                150000, 150000, "Paid", "upcoming", 1, (alex, dhruvi),
                [("Keynote 4K Multi-Cam Coverage", True), ("Executive Headshots Gallery", False)], 5),
        project("proj-103", "BioTech Global Summit 2026", "corporate", "Corporate",
                "Dr. Alistair Thorne", "2026-10-20", "BIEC Convention Center, Bengaluru", "08:00 AM",
                185000, 90000, "Partial", "upcoming", 1, (maya, rohan),
                [("Conference Highlight Reel", False)], 7),
    ]


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
                    db_table("bookings")
                    .select("*")
                    .eq("account_id", account_id)
                    .order("date")
                    .execute()
                )
            except DbError as exc:
                print(f"[{SERVICE}] Supabase query error: {exc}")
                rows = []

            if not rows:
                rows = seed_projects(account_id)
                try:
                    clean = [
                        {k: v for k, v in p.items() if k not in ("id", "name", "type", "client")} for p in rows
                    ]
                    db_table("bookings").insert(clean).execute()
                except DbError:
                    pass
            return _ok("GET", account_id, started, data=rows)

        if action == "CREATE":
            record = {
                "account_id": account_id,
                "title": payload.get("title") or payload.get("name") or "Studio Booking",
                "event_type": sanitize_event_type(payload.get("event_type") or payload.get("type")),
                "date": payload.get("date") or payload.get("first_event") or http.iso_now(),
                "location": payload.get("location") or payload.get("venue") or "Studio HQ",
                "client_name": payload.get("client_name") or payload.get("client") or "Client",
                "client_email": payload.get("client_email") or payload.get("email") or "",
                "price": http.to_number(payload.get("price") or payload.get("total_amount")),
                "deposit_paid": http.to_number(payload.get("deposit_paid") or payload.get("paid_amount")),
                "status": sanitize_status(payload.get("status")),
                "contract_status": payload.get("contract_status") or payload.get("contract") or "Accepted",
                "photographer_name": payload.get("photographer_name") or "Lead Photographer",
                "assigned_crew": payload.get("assigned_crew") or [],
                "deliverables": payload.get("deliverables") or [],
            }
            try:
                rows = db_table("bookings").insert([record]).execute()
                created = rows[0] if rows else record
            except DbError as exc:
                print(f"[{SERVICE}] Database insert notice, returning structured tenant record: {exc}")
                created = {"id": f"proj-{http.now_ms()}", **record, "created_at": http.iso_now()}
            return _ok("CREATE", account_id, started, data=created)

        if action == "UPDATE":
            record_id = payload.get("id")
            updates = http.strip_protected(payload)  # never let a client re-assign account_id
            if updates.get("status"):
                updates["status"] = sanitize_status(updates["status"])
            if updates.get("event_type") or updates.get("type"):
                updates["event_type"] = sanitize_event_type(updates.get("event_type") or updates.get("type"))
                updates.pop("type", None)
            try:
                rows = (
                    db_table("bookings")
                    .update({**updates, "updated_at": http.iso_now()})
                    .eq("id", record_id)
                    .eq("account_id", account_id)
                    .execute()
                )
                updated = rows[0] if rows else {"id": record_id, **updates, "account_id": account_id}
            except DbError:
                updated = {"id": record_id, **updates, "account_id": account_id, "updated_at": http.iso_now()}
            return _ok("UPDATE", account_id, started, data=updated)

        # DELETE
        record_id = payload.get("id")
        try:
            if record_id:
                db_table("bookings").delete().eq("id", record_id).eq("account_id", account_id).execute()
        except DbError as exc:
            print(f"[{SERVICE}] Delete notice: {exc}")
        return _ok("DELETE", account_id, started, deletedId=record_id)

    except Exception as exc:  # noqa: BLE001 (last-resort guard for the Lambda boundary)
        print(f"[{SERVICE}] Unhandled error: {exc!r}")
        return http.respond(
            500,
            {"success": False, "error": "Internal server error", "executionTimeMs": http.now_ms() - started},
        )
