CONTEXT = {"author_id": "00000000-0000-4000-8000-000000000001", "district_id": "00000000-0000-4000-8000-000000000002"}
CATEGORIES = [{"id": "integracja_spoleczna", "label": "Integracja społeczna"}]
import os
from threading import Event, Thread
from unittest import TestCase
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from rops_rag.api import UpstreamError, create_app


class ApiTests(TestCase):
    def test_valid_request_and_health(self):
        processor = Mock(return_value={**CONTEXT, "submission_id": "a", "decisions": []})
        client = TestClient(create_app(processor))
        self.assertEqual(client.get("/health").json(), {"status": "ok"})
        response = client.post("/api/ideas/analyze", json={**CONTEXT, "submission_id": "a", "text": "Pomysł", "categories": CATEGORIES})
        self.assertEqual(response.status_code, 200)
        processor.assert_called_once_with("a", "Pomysł", CATEGORIES, CONTEXT)

    def test_invalid_body_does_not_process(self):
        processor = Mock()
        client = TestClient(create_app(processor))
        for body in [{"text": "Pomysł"}, {**CONTEXT, "submission_id": " ", "text": "Pomysł"},
                     {**CONTEXT, "submission_id": "a", "text": "x" * 30001}]:
            self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 422)
        processor.assert_not_called()

    def test_conflict_and_upstream_error_release_gate(self):
        processor = Mock(side_effect=[ValueError("Ten identyfikator należy do innego tekstu"), UpstreamError(), {"ok": True}])
        client = TestClient(create_app(processor))
        body = {**CONTEXT, "submission_id": "a", "text": "Pomysł", "categories": CATEGORIES}
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 409)
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 502)
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 200)

    def test_concurrent_request_returns_busy(self):
        entered, release = Event(), Event()
        def processor(sid, text, categories, context):
            entered.set()
            release.wait(5)
            return {"ok": True}
        client = TestClient(create_app(processor))
        body = {**CONTEXT, "submission_id": "a", "text": "Pomysł", "categories": CATEGORIES}
        thread = Thread(target=lambda: client.post("/api/ideas/analyze", json=body))
        thread.start()
        try:
            self.assertTrue(entered.wait(3))
            response = client.post("/api/ideas/analyze", json=body)
            self.assertEqual(response.status_code, 503)
            self.assertEqual(response.json()["detail"]["code"], "busy")
            self.assertEqual(response.headers["Retry-After"], "5")
        finally:
            release.set()
            thread.join(5)

    def test_cors_preflight_allows_only_configured_frontend(self):
        processor = Mock(return_value={"ok": True})
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://frontend.example"}):
            client = TestClient(create_app(processor))
        headers = {"Origin": "https://frontend.example",
                   "Access-Control-Request-Method": "POST",
                   "Access-Control-Request-Headers": "content-type"}
        response = client.options("/api/ideas/analyze", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], headers["Origin"])
        processor.assert_not_called()
        headers["Origin"] = "https://other.example"
        response = client.options("/api/ideas/analyze", headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access-control-allow-origin", response.headers)

    def test_cors_error_exposes_retry_after(self):
        from rops_rag.errors import BusyError
        processor = Mock(side_effect=BusyError())
        with patch.dict(os.environ, {"CORS_ORIGINS": "https://frontend.example"}):
            client = TestClient(create_app(processor))
        response = client.post("/api/ideas/analyze", headers={"Origin": "https://frontend.example"},
            json={**CONTEXT, "submission_id": "a", "text": "Pomysł", "categories": CATEGORIES})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.headers["access-control-allow-origin"], "https://frontend.example")
        self.assertEqual(response.headers["access-control-expose-headers"], "Retry-After")
        self.assertEqual(response.headers["Retry-After"], "5")

    def test_application_context_is_required_and_uuid_validated(self):
        processor = Mock()
        client = TestClient(create_app(processor))
        body = {**CONTEXT, "submission_id":"a", "text":"Pomysł", "categories":CATEGORIES}
        for key in ("author_id", "district_id"):
            missing = dict(body)
            del missing[key]
            self.assertEqual(client.post("/api/ideas/analyze",json=missing).status_code,422)
            self.assertEqual(client.post("/api/ideas/analyze",json={**body,key:"not-a-guid"}).status_code,422)
        processor.assert_not_called()
