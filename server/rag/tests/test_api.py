import os
from threading import Event, Thread
from unittest import TestCase
from unittest.mock import Mock

from fastapi.testclient import TestClient

from rops_rag.api import UpstreamError, create_app


class ApiTests(TestCase):
    def test_http_pipeline_persists_and_replays(self):
        from pg_support import test_database, close_test_database
        from rops_rag.comparison import Decision
        from rops_rag.database import Database
        from rops_rag.extraction import ExtractionResult
        from rops_rag.pipeline import Pipeline
        from rops_rag.retrieval import Retriever
        db = test_database()
        extractor = Mock()
        extractor.extract.return_value = ExtractionResult.model_validate({
            "status": "ok", "questions": [], "concepts": [{"problem": "Samotność",
            "audience": "Seniorzy", "solution": "Rozmowy telefoniczne",
            "category": "integracja_spoleczna", "context": "", "source_quote": "Pomysł"}]})
        embedder = Mock(model="test-model")
        embedder.embed.return_value = [1, 0]
        comparator = Mock()
        comparator.compare.return_value = Decision(kind="new", candidate_id=None, reason="Nowy", questions=[])
        try:
            def process(sid, text):
                worker_db = Database(os.environ["TEST_DATABASE_URL"], schema=db.schema)
                try:
                    return Pipeline(worker_db, extractor, Retriever(worker_db, embedder), comparator).process(sid, text)
                finally:
                    worker_db.close()
            client = TestClient(create_app(process))
            body = {"submission_id": "a", "text": "Pomysł"}
            first = client.post("/api/ideas/analyze", json=body)
            self.assertEqual(first.status_code, 200)
            self.assertEqual(first.json()["decisions"][0]["liczba_zgloszen"], 1)
            self.assertTrue(client.post("/api/ideas/analyze", json=body).json()["replayed"])
            extractor.extract.assert_called_once()
        finally:
            close_test_database(db)

    def test_valid_request_and_health(self):
        processor = Mock(return_value={"submission_id": "a", "decisions": []})
        client = TestClient(create_app(processor))
        self.assertEqual(client.get("/health").json(), {"status": "ok"})
        response = client.post("/api/ideas/analyze", json={"submission_id": "a", "text": "Pomysł"})
        self.assertEqual(response.status_code, 200)
        processor.assert_called_once_with("a", "Pomysł")

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
        body = {"submission_id": "a", "text": "Pomysł"}
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 409)
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 502)
        self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 200)

    def test_concurrent_request_returns_busy(self):
        entered, release = Event(), Event()
        def processor(sid, text):
            entered.set()
            release.wait(5)
            return {"ok": True}
        client = TestClient(create_app(processor))
        body = {"submission_id": "a", "text": "Pomysł"}
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
