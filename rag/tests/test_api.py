CATEGORIES = [{"id": "integracja_spoleczna", "label": "Integracja społeczna"}]
import os
from threading import Event, Thread
from unittest import TestCase
from unittest.mock import Mock

from fastapi.testclient import TestClient

from rops_rag.api import UpstreamError, create_app


class ApiTests(TestCase):
    def test_valid_request_and_health(self):
        processor = Mock(return_value={"submission_id": "a", "decisions": []})
        client = TestClient(create_app(processor))
        self.assertEqual(client.get("/health").json(), {"status": "ok"})
        response = client.post("/api/ideas/analyze", json={"submission_id": "a", "text": "Pomysł", "categories": CATEGORIES})
        self.assertEqual(response.status_code, 200)
        processor.assert_called_once_with("a", "Pomysł", CATEGORIES)

    def test_invalid_body_does_not_process(self):
        processor = Mock()
        client = TestClient(create_app(processor))
        for body in [{"text": "Pomysł"}, {"submission_id": " ", "text": "Pomysł"},
                     {"submission_id": "a", "text": "x" * 30001}]:
            self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 422)
        processor.assert_not_called()

    def test_conflict_and_upstream_error_release_gate(self):
        processor = Mock(side_effect=[ValueError("Ten identyfikator należy do innego tekstu"), UpstreamError(), {"ok": True}])
        client = TestClient(create_app(processor))
        body = {"submission_id": "a", "text": "Pomysł", "categories": CATEGORIES}
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 409)
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 502)
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 200)

    def test_concurrent_request_returns_busy(self):
        entered, release = Event(), Event()
        def processor(sid, text, categories):
            entered.set()
            release.wait(5)
            return {"ok": True}
        client = TestClient(create_app(processor))
        body = {"submission_id": "a", "text": "Pomysł", "categories": CATEGORIES}
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
