"""
Pixeva CRM — Local Lambda Development Server (Python)
======================================================
Wraps lambda functions in a real HTTP server so you can test AWS Lambda
microservices locally without Docker, SAM, or AWS deployment.

Usage:
    cd lambda
    python local_dev.py
    # or python3 lambda/local_dev.py

Default URL: http://localhost:5001
"""

import os
import sys
import json
import base64
import subprocess
import traceback
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import urlparse, parse_qs

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle each request in a separate thread."""
    daemon_threads = True
    allow_reuse_address = True

# ─── Load environment variables from .env.local or .env ──────────────────────
root_dir = Path(__file__).resolve().parent.parent
for env_name in [".env.local", ".env", ".env.example"]:
    env_path = root_dir / env_name
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))
        print(f"[local_dev.py] Loaded env from {env_name}")
        break

os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("NEXT_PUBLIC_SUPABASE_URL", "https://lmagwuarvxhhvoacezvl.supabase.co")

FUNCTIONS_DIR = Path(__file__).resolve().parent / "functions"

# ─── Discover Functions ───────────────────────────────────────────────────────
functions_map = {}
if FUNCTIONS_DIR.exists():
    for entry in FUNCTIONS_DIR.iterdir():
        if entry.is_dir() and (entry / "index.js").exists():
            functions_map[entry.name] = str(entry / "index.js")
            alias = entry.name.replace("-service", "")
            functions_map[alias] = str(entry / "index.js")

print(f"[local_dev.py] Registered Lambda functions: {list(set(functions_map.keys()))}")

# ─── Invoke JS Lambda function via Node runner ───────────────────────────────
def invoke_js_lambda(file_path, event):
    event_json = json.dumps(event)
    runner_script = f"""
    const path = require('path');
    const mod = require({json.dumps(file_path)});
    const event = {event_json};
    Promise.resolve(mod.handler(event, {{}}))
      .then(res => {{
        process.stdout.write(JSON.stringify(res));
      }})
      .catch(err => {{
        process.stderr.write(err.stack || err.message);
        process.exit(1);
      }});
    """
    proc = subprocess.run(
        ["node", "-e", runner_script],
        capture_output=True,
        text=True,
        cwd=str(root_dir),
        env=os.environ
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Lambda execution error: {proc.stderr}")
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        return {"statusCode": 200, "body": proc.stdout}

# ─── Build API Gateway event ──────────────────────────────────────────────────
def build_api_gateway_event(method, path, query_string, headers, body_bytes, content_type):
    is_base64 = False
    body = None
    if body_bytes:
        try:
            body = body_bytes.decode("utf-8")
        except UnicodeDecodeError:
            body = base64.b64encode(body_bytes).decode("utf-8")
            is_base64 = True

    query_params = None
    if query_string:
        parsed = parse_qs(query_string, keep_blank_values=True)
        query_params = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}

    return {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": path,
        "rawQueryString": query_string or "",
        "headers": dict(headers),
        "queryStringParameters": query_params,
        "body": body,
        "isBase64Encoded": is_base64,
        "requestContext": {
            "http": {"method": method, "path": path},
            "stage": "local"
        },
        "httpMethod": method,
        "path": path,
    }

# ─── HTTP Request Handler ─────────────────────────────────────────────────────
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Amz-Date, X-Api-Key",
}

class LambdaProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def handle_request(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        query_string = parsed.query

        # OPTIONS Preflight
        if self.command == "OPTIONS":
            self.send_response(200)
            for k, v in CORS_HEADERS.items():
                self.send_header(k, v)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return

        headers = {k: v for k, v in self.headers.items()}
        content_length = int(headers.get("Content-Length", headers.get("content-length", 0)) or 0)
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        content_type = headers.get("Content-Type", "")

        # Health check
        if path in ("/", "/health"):
            payload = json.dumps({
                "status": "online",
                "service": "Pixeva CRM Local Lambda Server (Python)",
                "availableFunctions": list(set(functions_map.keys())),
            }, indent=2).encode("utf-8")
            self.send_response(200)
            for k, v in CORS_HEADERS.items():
                self.send_header(k, v)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # Determine target
        target = None
        if path.startswith("/invoke/"):
            target = path.split("/invoke/")[1]
        elif path.startswith("/2015-03-31/functions/"):
            target = path.split("/2015-03-31/functions/")[1].split("/invocations")[0]
        else:
            seg = path.strip("/").split("/")[0]
            if seg in functions_map:
                target = seg

        if not target or target not in functions_map:
            err_body = json.dumps({"error": "NotFound", "message": f"No Lambda function for {path}"}).encode("utf-8")
            self.send_response(404)
            for k, v in CORS_HEADERS.items():
                self.send_header(k, v)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)
            return

        event = build_api_gateway_event(self.command, path, query_string, headers, body_bytes, content_type)

        try:
            result = invoke_js_lambda(functions_map[target], event)
            status_code = result.get("statusCode", 200)
            res_headers = {**CORS_HEADERS, **result.get("headers", {})}
            body_str = result.get("body", "")

            if isinstance(body_str, (dict, list)):
                body_bytes = json.dumps(body_str).encode("utf-8")
                res_headers["Content-Type"] = "application/json"
            elif isinstance(body_str, str):
                body_bytes = body_str.encode("utf-8")
            else:
                body_bytes = str(body_str or "").encode("utf-8")

            self.send_response(status_code)
            for k, v in res_headers.items():
                self.send_header(k, v)
            self.send_header("Content-Length", str(len(body_bytes)))
            self.end_headers()
            self.wfile.write(body_bytes)
            print(f"[local_dev.py] [{self.command}] {path} -> {target} | {status_code}")
        except Exception as e:
            traceback.print_exc()
            err_body = json.dumps({"error": "LambdaExecutionError", "message": str(e)}).encode("utf-8")
            self.send_response(500)
            for k, v in CORS_HEADERS.items():
                self.send_header(k, v)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(err_body)))
            self.end_headers()
            self.wfile.write(err_body)

    def do_GET(self):    self.handle_request()
    def do_POST(self):   self.handle_request()
    def do_PUT(self):    self.handle_request()
    def do_PATCH(self):  self.handle_request()
    def do_DELETE(self): self.handle_request()
    def do_OPTIONS(self):self.handle_request()

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", os.environ.get("LAMBDA_PORT", 5001)))
    server = ThreadedHTTPServer(("0.0.0.0", PORT), LambdaProxyHandler)
    print(f"\n============================================================")
    print(f"⚡ Pixeva Local Lambda Server (Python) running at http://localhost:{PORT}")
    print(f"🩺 Health: http://localhost:{PORT}/health")
    print(f"============================================================\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[local_dev.py] Server stopped.")
