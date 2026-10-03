from unittest import TestCase
from unittest.mock import Mock
from types import SimpleNamespace
from fastapi.testclient import TestClient
from pydantic import ValidationError
from rops_rag.api import create_app
from rops_rag.categories import validate_categories
from rops_rag.extraction import ExtractedConcept, ExtractionResult, ExtractionError, OpenAIExtractor

class CategoryTests(TestCase):
    def test_backend_categories_are_passed_to_processor(self):
        categories = [{"id": "custom-123", "label": "Kategoria backendu"}]
        processor = Mock(return_value={"ok": True})
        client = TestClient(create_app(processor))
        response = client.post("/api/ideas/analyze", json={"submission_id": "a", "text": "Pomysł", "categories": categories})
        self.assertEqual(response.status_code, 200)
        processor.assert_called_once_with("a", "Pomysł", categories)

    def test_missing_empty_or_duplicate_categories_rejected(self):
        processor = Mock()
        client = TestClient(create_app(processor))
        base = {"submission_id": "a", "text": "Pomysł"}
        for cats in [None, [], [{"id": "x", "label": "X"}]*2, [{"id": 1, "label": "X"}]]:
            body = dict(base)
            if cats is not None:
                body["categories"] = cats
            self.assertEqual(client.post("/api/ideas/analyze", json=body).status_code, 422)
        processor.assert_not_called()

    def test_model_cannot_invent_category(self):
        result = ExtractionResult(status="ok", questions=[], concepts=[ExtractedConcept(
            problem="Problem", audience="Odbiorcy", solution="Działanie", category="invented",
            context="", source_quote="Pomysł")])
        client = Mock()
        client.responses.parse.return_value = SimpleNamespace(status="completed", output_parsed=result)
        with self.assertRaisesRegex(ExtractionError, "spoza listy"):
            OpenAIExtractor(client, "test-model").extract("Pomysł", [{"id": "allowed", "label": "Dozwolona"}])

    def test_no_category_catalog_endpoint(self):
        self.assertEqual(TestClient(create_app(Mock())).get("/api/categories").status_code, 404)
