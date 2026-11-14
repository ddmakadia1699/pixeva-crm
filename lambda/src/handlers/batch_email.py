"""Batch CRM lead campaign engine (stub): POST /batch-email."""

from __future__ import annotations

from common import auth, http, ratelimit


def handler(event, context=None):
    if http.http_method(event) == "OPTIONS":
        return http.respond(200)

    result = auth.authenticate(event)
    if not result["ok"]:
        return auth.auth_failure(result)

    limited = ratelimit.guard("worker", result["user_id"])
    if limited:
        return limited

    try:
        payload = http.parse_json_body(event)
    except http.BadRequest as exc:
        return http.respond(exc.status, {"success": False, "error": str(exc)})

    # Never log the raw event: it contains the caller's bearer token.
    print("Batch email requested")

    recipients = payload.get("recipients")
    total = len(recipients) if isinstance(recipients, list) else 12
    name = payload.get("campaignName") or "Lead Nurture Sequence"
    return http.respond(
        200,
        {
            "success": True,
            "message": f"Batch email campaign '{name}' dispatched via AWS Lambda.",
            "metrics": {
                "totalRecipients": total,
                "successfulDispatches": total,
                "failedDispatches": 0,
                "executedAt": http.iso_now(),
            },
        },
    )
