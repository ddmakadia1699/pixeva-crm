"""PDF invoice & quote generator (stub): POST /pdf-generator."""

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
    print("PDF generation requested")

    # Perform PDF generation here (e.g. with a PDF library).
    doc = {
        "docId": f"INV-{str(http.now_ms())[-6:]}",
        "dealId": payload.get("dealId") or "N/A",
        "clientName": payload.get("clientName") or "Valued Customer",
        "totalAmount": payload.get("amount") or 0,
        "generatedAt": http.iso_now(),
        "status": "COMPLETED",
    }
    return http.respond(
        200,
        {"success": True, "message": "PDF Invoice successfully rendered by AWS Lambda service.", "data": doc},
    )
