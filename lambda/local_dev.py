"""
Pixeva CRM - Local Lambda Development Server (Python 3.14)
===========================================================
Runs the Python Lambda handlers behind a real HTTP server that builds API Gateway
(payload v2.0) events, so the frontend can be developed without deploying to AWS.

Usage (from the repo root):
    python -m venv lambda/.venv
    lambda/.venv/Scripts/python -m pip install -r lambda/src/requirements.txt   # Windows
    lambda/.venv/Scripts/python lambda/local_dev.py

Default URL: http://localhost:5001  (the frontend uses it automatically on localhost)
Requests need a real Supabase login token, exactly like production.
"""

from __future__ import annotations

import base64
import importlib
import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from socketserver import ThreadingMixIn
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

# --- Load environment variables from .env.local / .env -----------------------
for env_name in (".env.local", ".env"):
    env_path = ROOT / env_name
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
        print(f"[local_dev] Loaded environment from {env_name}")
        break

os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("NEXT_PUBLIC_SUPABASE_URL", "https://batspallqzaxubikuuks.supabase.co")

# First path segment -> handler module
ROUTES = {
    "enquiries": "enquiries_service",
    "bookings": "bookings_service",
    "projects": "bookings_service",
    "contracts": "contracts_service",
    "studio-data": "studio_data_service",
    "galleries": "studio_data_service",
    "client-requests": "studio_data_service",
    "finances": "studio_data_service",
    "dashboard": "studio_data_service",
    "pdf-generator": "pdf_generator",
    "batch-email": "batch_email",
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
}


def load_handler(module_name: str):
    module = importlib.import_module(f"handlers.{module_name}")
    return importlib.reload(module).handler  # reload so code edits apply without a restart


def build_event(method: str, path: str, query: str, headers: dict, body: bytes) -> dict:
    is_base64 = False
    text = None
    if body:
        try:
            text = body.decode("utf-8")
        except UnicodeDecodeError:
            text = base64.b64encode(body).decode("ascii")
            is_base64 = True
    params = {k: v[0] for k, v in parse_qs(query, keep_blank_values=True).items()} if query else None
    return {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": path,
        "rawQueryString": query,
        "headers": {k.lower(): v for k, v in headers.items()},
        "queryStringParameters": params,
        "requestContext": {"http": {"method": method, "path": path}, "stage": "local"},
        "body": text,
        "isBase64Encoded": is_base64,
    }


class ThreadedServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class Proxy(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):  # silence default logging
        pass

    def _send(self, status: int, headers: dict, body: bytes):
        self.send_response(status)
        for k, v in {**CORS_HEADERS, **headers}.items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status: int, payload: dict):
        self._send(status, {"Content-Type": "application/json"}, json.dumps(payload, indent=2).encode())

    def handle_any(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        if self.command == "OPTIONS":
            return self._send(200, {}, b"")
        if path in ("/", "/health"):
            return self._json(200, {"status": "online", "runtime": "python", "routes": sorted(ROUTES)})

        segment = path.strip("/").split("/")[0]
        module_name = ROUTES.get(segment)
        if not module_name:
            return self._json(404, {"error": "NotFound", "message": f"No Lambda function for {path}"})

        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else b""
        event = build_event(self.command, path, parsed.query, dict(self.headers.items()), body)

        try:
            result = load_handler(module_name)(event, None)
        except Exception as exc:  # noqa: BLE001
            traceback.print_exc()
            return self._json(500, {"error": "LambdaExecutionError", "message": str(exc)})

        out = result.get("body") or ""
        if not isinstance(out, str):
            out = json.dumps(out)
        self._send(result.get("statusCode", 200), result.get("headers") or {}, out.encode("utf-8"))
        print(f"[local_dev] {self.command} {path} -> {module_name} | {result.get('statusCode', 200)}")

    do_GET = do_POST = do_PUT = do_DELETE = do_OPTIONS = handle_any


if __name__ == "__main__":
    port = int(os.environ.get("PORT", os.environ.get("LAMBDA_PORT", 5001)))
    server = ThreadedServer(("127.0.0.1", port), Proxy)
    print(f"\nPixeva local Lambda server (Python {sys.version.split()[0]}) on http://localhost:{port}")
    print(f"Health: http://localhost:{port}/health\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[local_dev] Server stopped.")
