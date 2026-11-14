"""Auth + handler tests. Run from the repo root:

    python -m unittest discover -s lambda/tests -v

Uses a throwaway ES256 key and a local JWKS server, so no network or real login is needed.
"""

import json
import os
import sys
import threading
import time
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import jwt
from cryptography.hazmat.primitives.asymmetric import ec

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

KID = "test-key"
GOOD_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())


def _jwks_document() -> dict:
    jwk = json.loads(jwt.algorithms.ECAlgorithm.to_jwk(GOOD_KEY.public_key()))
    jwk.update(kid=KID, alg="ES256", use="sig")
    return {"keys": [jwk]}


class _JwksHandler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        body = json.dumps(_jwks_document()).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class AuthAndHandlerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), _JwksHandler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"
        os.environ["NEXT_PUBLIC_SUPABASE_URL"] = cls.base
        os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "dummy_replace_me"  # DB disabled: handlers use fallbacks
        os.environ.pop("NEXT_PUBLIC_SUPABASE_ANON_KEY", None)

        from handlers import (batch_email, bookings_service, contracts_service, enquiries_service,
                              pdf_generator, studio_data_service)
        cls.enquiries = staticmethod(enquiries_service.handler)
        cls.bookings = staticmethod(bookings_service.handler)
        cls.contracts = staticmethod(contracts_service.handler)
        cls.studio = staticmethod(studio_data_service.handler)
        cls.pdf = staticmethod(pdf_generator.handler)
        cls.mail = staticmethod(batch_email.handler)

        now = int(time.time())

        def sign(key=GOOD_KEY, alg="ES256", **over):
            claims = {"sub": "user-A", "iss": f"{cls.base}/auth/v1", "aud": "authenticated",
                      "iat": now - 120, "exp": now + 3600, "role": "authenticated"}
            claims.update(over)
            return jwt.encode(claims, key, algorithm=alg, headers={"kid": KID})

        cls.tokens = {
            "valid": sign(),
            "forged": sign(key=OTHER_KEY),
            "expired": sign(exp=now - 60),
            "bad_issuer": sign(iss="https://evil.example/auth/v1"),
            "bad_audience": sign(aud="anon"),
            "hs256": jwt.encode({"sub": "user-A", "iss": f"{cls.base}/auth/v1", "aud": "authenticated",
                                 "exp": now + 3600}, "x" * 48, algorithm="HS256", headers={"kid": KID}),
            "alg_none": jwt.encode({"sub": "user-A", "iss": f"{cls.base}/auth/v1", "aud": "authenticated",
                                    "exp": now + 3600}, None, algorithm="none", headers={"kid": KID}),
            "no_sub": sign(sub=None),
        }
        cls.tokens["no_sub"] = jwt.encode(
            {"iss": f"{cls.base}/auth/v1", "aud": "authenticated", "exp": now + 3600},
            GOOD_KEY, algorithm="ES256", headers={"kid": KID})

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    # --- helpers -------------------------------------------------------------
    @staticmethod
    def event(method, path, token=None, headers=None, body=None, qs=""):
        hdrs = dict(headers or {})
        if token:
            hdrs["authorization"] = f"Bearer {token}"
        return {"version": "2.0", "rawPath": path, "rawQueryString": qs, "headers": hdrs,
                "requestContext": {"http": {"method": method}},
                "body": json.dumps(body) if body is not None else None}

    def call(self, handler, event):
        res = handler(event)
        return res["statusCode"], (json.loads(res["body"]) if res["body"] else {})

    def assertStatus(self, handler, event, status, account=None):
        code, body = self.call(handler, event)
        self.assertEqual(code, status, body)
        if account is not None:
            self.assertEqual(body.get("accountId"), account)
        return body

    # --- enquiries -----------------------------------------------------------
    def test_get_requires_valid_token(self):
        e = self.enquiries
        self.assertStatus(e, self.event("GET", "/enquiries"), 401)
        self.assertStatus(e, self.event("GET", "/enquiries", token="not.a.jwt"), 401)
        self.assertStatus(e, self.event("GET", "/enquiries", token=self.tokens["valid"]), 200, "user-A")

    def test_rejects_bad_tokens(self):
        for name in ("forged", "expired", "bad_issuer", "bad_audience", "hs256", "alg_none", "no_sub"):
            with self.subTest(token=name):
                self.assertStatus(self.enquiries, self.event("GET", "/enquiries", token=self.tokens[name]), 401)

    def test_spoofed_account_is_ignored(self):
        ev = self.event("GET", "/enquiries", token=self.tokens["valid"],
                        headers={"x-account-id": "victim"}, qs="account_id=victim&accountId=victim")
        self.assertStatus(self.enquiries, ev, 200, "user-A")

    def test_writes_require_auth(self):
        e = self.enquiries
        self.assertStatus(e, self.event("PUT", "/enquiries", body={"id": "x", "status": "new", "account_id": "victim"}), 401)
        self.assertStatus(e, self.event("DELETE", "/enquiries", qs="id=1"), 401)
        self.assertStatus(e, self.event("DELETE", "/enquiries", body={"clearAll": True, "account_id": "victim"}), 401)

    def test_public_enquiry_form(self):
        e = self.enquiries
        body = {"name": "A B", "email": "a@b.co", "account_id": "studio-1"}
        self.assertStatus(e, self.event("POST", "/enquiries", body=body), 200, "studio-1")
        self.assertStatus(e, self.event("POST", "/enquiries", body={"name": "A B"}), 401)
        # an invalid token must never fall back to the public path
        self.assertStatus(e, self.event("POST", "/enquiries", token=self.tokens["forged"],
                                        body={"name": "A", "account_id": "victim"}), 401)
        # a valid token ignores any body account_id
        self.assertStatus(e, self.event("POST", "/enquiries", token=self.tokens["valid"],
                                        body={"name": "A B", "account_id": "victim"}), 200, "user-A")

    def test_public_enquiry_clamps_long_fields(self):
        body = self.assertStatus(self.enquiries, self.event(
            "POST", "/enquiries", body={"name": "A", "notes": "x" * 50000, "account_id": "studio-1"}), 200)
        self.assertLessEqual(len(body["data"]["notes"]), 1100)

    def test_bad_json_and_method(self):
        ev = self.event("POST", "/enquiries", token=self.tokens["valid"])
        ev["body"] = "{not json"
        self.assertStatus(self.enquiries, ev, 400)
        self.assertStatus(self.enquiries, self.event("PATCH", "/enquiries", token=self.tokens["valid"]), 405)

    def test_options_preflight(self):
        res = self.enquiries(self.event("OPTIONS", "/enquiries"))
        self.assertEqual(res["statusCode"], 200)
        self.assertIn("Authorization", res["headers"]["Access-Control-Allow-Headers"])

    # --- other services ------------------------------------------------------
    def test_other_services_require_auth(self):
        cases = [("bookings", self.bookings, "/bookings"), ("contracts", self.contracts, "/contracts"),
                 ("dashboard", self.studio, "/dashboard"), ("galleries", self.studio, "/galleries"),
                 ("finances", self.studio, "/finances"), ("client-requests", self.studio, "/client-requests")]
        for name, handler, path in cases:
            with self.subTest(service=name):
                self.assertStatus(handler, self.event("GET", path), 401)
                self.assertStatus(handler, self.event("GET", path, token=self.tokens["forged"]), 401)
                self.assertStatus(handler, self.event("GET", path, token=self.tokens["valid"]), 200)

    def test_unauthenticated_writes_rejected(self):
        self.assertStatus(self.bookings, self.event("POST", "/bookings", body={"account_id": "victim"}), 401)
        self.assertStatus(self.contracts, self.event("PUT", "/contracts", body={"id": "ct-2"}), 401)
        self.assertStatus(self.pdf, self.event("POST", "/pdf-generator", body={}), 401)
        self.assertStatus(self.mail, self.event("POST", "/batch-email", body={}), 401)

    def test_stubs_work_when_authenticated(self):
        self.assertStatus(self.pdf, self.event("POST", "/pdf-generator", token=self.tokens["valid"], body={"amount": 5}), 200)
        body = self.assertStatus(self.mail, self.event("POST", "/batch-email", token=self.tokens["valid"],
                                                       body={"recipients": ["a", "b", "c"]}), 200)
        self.assertEqual(body["metrics"]["totalRecipients"], 3)

    def test_bookings_seed_and_create(self):
        body = self.assertStatus(self.bookings, self.event("GET", "/bookings", token=self.tokens["valid"]), 200, "user-A")
        self.assertEqual(len(body["data"]), 3)
        self.assertTrue(all(p["account_id"] == "user-A" for p in body["data"]))
        created = self.assertStatus(self.bookings, self.event("POST", "/bookings", token=self.tokens["valid"],
                                                              body={"title": "T", "price": "1500", "account_id": "victim"}), 200)
        self.assertEqual(created["data"]["account_id"], "user-A")
        self.assertEqual(created["data"]["price"], 1500)

    def test_update_cannot_reassign_tenant(self):
        body = self.assertStatus(self.bookings, self.event(
            "PUT", "/bookings", token=self.tokens["valid"],
            body={"id": "p1", "status": "completed", "account_id": "victim"}), 200)
        self.assertEqual(body["data"]["account_id"], "user-A")

    def test_dashboard_shape(self):
        body = self.assertStatus(self.studio, self.event("GET", "/dashboard", token=self.tokens["valid"]), 200)
        for key in ("enquiriesNew", "totalEnquiries", "activeProjectsCount", "clientRequestsPending"):
            self.assertIn(key, body["data"])


class DbClientTests(unittest.TestCase):
    def test_query_building(self):
        from common.db import Supabase
        sent = {}

        class Fake(Supabase):
            def request(self, method, table, params, body, prefer):
                sent.update(method=method, table=table, params=params, body=body, prefer=prefer)
                return []

        db = Fake("https://x.supabase.co", "k")
        db.table("leads").delete().in_("id", ['a"b', "c"]).eq("account_id", "u&x=1").execute()
        self.assertEqual(sent["method"], "DELETE")
        self.assertEqual(sent["prefer"], "return=minimal")
        self.assertIn(("id", 'in.("a\\"b","c")'), sent["params"])
        self.assertIn(("account_id", "eq.u&x=1"), sent["params"])

    def test_not_configured(self):
        from common import db
        os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "dummy_x"
        with self.assertRaises(db.DbError):
            db.db_table("leads")


class _FakeSupabase(BaseHTTPRequestHandler):
    """Serves the JWKS plus a scripted PostgREST API and records every REST request."""

    requests: list = []
    script: list = []  # queue of (status, json_body) replies for /rest/v1 calls

    def _reply(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _handle(self):
        if self.path.startswith("/auth/v1/.well-known/jwks.json"):
            return self._reply(200, _jwks_document())
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        type(self).requests.append({
            "method": self.command, "path": self.path,
            "headers": {k.lower(): v for k, v in self.headers.items()},  # header names are case-insensitive
            "body": json.loads(raw) if raw else None,
        })
        status, payload = type(self).script.pop(0) if type(self).script else (200, [])
        self._reply(status, payload)

    do_GET = do_POST = do_PATCH = do_DELETE = _handle

    def log_message(self, *args):
        pass


class LiveDatabasePathTests(unittest.TestCase):
    """Runs the handlers with Supabase 'configured', against a fake PostgREST server."""

    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), _FakeSupabase)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"
        os.environ["NEXT_PUBLIC_SUPABASE_URL"] = cls.base
        now = int(time.time())
        cls.token = jwt.encode(
            {"sub": "user-A", "iss": f"{cls.base}/auth/v1", "aud": "authenticated", "exp": now + 3600},
            GOOD_KEY, algorithm="ES256", headers={"kid": KID})

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        _FakeSupabase.requests = []
        _FakeSupabase.script = []
        os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "sb_secret_opaque_test_key"

    def call(self, handler, method, path, body=None, qs=""):
        event = {"rawPath": path, "rawQueryString": qs, "headers": {"authorization": f"Bearer {self.token}"},
                 "requestContext": {"http": {"method": method}}, "body": json.dumps(body) if body else None}
        res = handler(event)
        return res["statusCode"], (json.loads(res["body"]) if res["body"] else {})

    def test_list_is_scoped_to_verified_account(self):
        from handlers import enquiries_service
        _FakeSupabase.script = [(200, [{"id": "1", "first_name": "Ana"}])]
        code, body = self.call(enquiries_service.handler, "GET", "/enquiries")
        self.assertEqual(code, 200)
        self.assertEqual(body["data"], [{"id": "1", "first_name": "Ana"}])
        sent = _FakeSupabase.requests[-1]
        self.assertTrue(sent["path"].startswith("/rest/v1/leads?"))
        self.assertIn("account_id=eq.user-A", sent["path"])
        self.assertIn("order=created_at.desc", sent["path"])
        self.assertEqual(sent["headers"]["apikey"], "sb_secret_opaque_test_key")
        self.assertNotIn("authorization", sent["headers"])  # opaque keys go in apikey only

    def test_legacy_jwt_key_is_also_sent_as_bearer(self):
        from handlers import enquiries_service
        os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "eyJhbGciOi.legacy.jwt"
        _FakeSupabase.script = [(200, [])]
        self.call(enquiries_service.handler, "GET", "/enquiries")
        self.assertEqual(_FakeSupabase.requests[-1]["headers"]["authorization"], "Bearer eyJhbGciOi.legacy.jwt")

    def test_create_inserts_with_token_account_not_body_account(self):
        from handlers import enquiries_service
        _FakeSupabase.script = [(201, [{"id": "9", "account_id": "user-A"}])]
        code, body = self.call(enquiries_service.handler, "POST", "/enquiries",
                               {"name": "Sam Lee", "email": "s@l.co", "account_id": "victim"})
        self.assertEqual(code, 200)
        self.assertEqual(body["data"]["id"], "9")
        sent = _FakeSupabase.requests[-1]
        self.assertEqual(sent["method"], "POST")
        self.assertEqual(sent["body"][0]["account_id"], "user-A")
        self.assertEqual(sent["body"][0]["first_name"], "Sam")
        self.assertEqual(sent["headers"]["prefer"], "return=representation")

    def test_duplicate_email_is_retried_once(self):
        from handlers import enquiries_service
        _FakeSupabase.script = [(409, {"code": "23505", "message": "duplicate key"}), (201, [{"id": "10"}])]
        code, body = self.call(enquiries_service.handler, "POST", "/enquiries", {"name": "Sam", "email": "dup@x.co"})
        self.assertEqual((code, body["data"]["id"]), (200, "10"))
        self.assertEqual(len(_FakeSupabase.requests), 2)
        self.assertNotEqual(_FakeSupabase.requests[0]["body"][0]["email"], _FakeSupabase.requests[1]["body"][0]["email"])

    def test_batch_delete_is_account_scoped(self):
        from handlers import enquiries_service
        _FakeSupabase.script = [(204, [])]
        code, _ = self.call(enquiries_service.handler, "DELETE", "/enquiries", {"ids": ["1", "2"]})
        self.assertEqual(code, 200)
        sent = _FakeSupabase.requests[-1]
        self.assertEqual(sent["method"], "DELETE")
        self.assertIn("account_id=eq.user-A", sent["path"])
        self.assertIn("id=in.", sent["path"])

    def test_update_never_changes_owner(self):
        from handlers import bookings_service
        _FakeSupabase.script = [(200, [{"id": "p1", "status": "completed"}])]
        code, _ = self.call(bookings_service.handler, "PUT", "/bookings",
                            {"id": "p1", "status": "done", "account_id": "victim"})
        self.assertEqual(code, 200)
        sent = _FakeSupabase.requests[-1]
        self.assertEqual(sent["method"], "PATCH")
        self.assertNotIn("account_id", sent["body"])
        self.assertIn("account_id=eq.user-A", sent["path"])

    def test_database_outage_falls_back_without_crashing(self):
        from handlers import contracts_service
        _FakeSupabase.script = [(500, {"message": "boom"})]
        code, body = self.call(contracts_service.handler, "GET", "/contracts")
        self.assertEqual((code, body["data"]), (200, []))


if __name__ == "__main__":
    unittest.main()
