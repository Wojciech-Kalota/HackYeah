from unittest import TestCase
from unittest.mock import Mock
from types import SimpleNamespace
from fastapi.testclient import TestClient
from pydantic import ValidationError
from rops_rag.api import create_app
from rops_rag.categories import validate_categories
from rops_rag.extraction import ExtractedConcept, ExtractionResult, ExtractionError, OpenAIExtractor, extraction_schema
from openai.lib._pydantic import to_strict_json_schema

class CategoryTests(TestCase):
    def test_request_schema_restricts_ids_not_labels(self):
        categories=[{"id":"1","label":"Bezpieczeństwo"},
                    {"id":"2","label":"Cyberbezpieczeństwo"},
                    {"id":"3","label":"Infrastruktura drogowa"},
                    {"id":"4","label":"Inne"}]
        model=extraction_schema(categories)
        schema=to_strict_json_schema(model)
        self.assertEqual(schema["$defs"]["AllowedCategory"]["enum"],["1","2","3","4"])
        data={"status":"ok","concepts":[{"problem":"Niedostępne PDF",
              "audience":"Osoby korzystające z czytnika ekranu","solution":"Zgłaszanie problemów",
              "category":"4","context":"","assessment":{"cost":3,"duration":3,"importance":3,"reach":3},"source_quote":"Niedostępne PDF"}]}
        self.assertEqual(model.model_validate(data).model_dump(mode="json")["concepts"][0]["category"],"4")
        for invalid in ("dostepnosc","Inne","5"):
            data["concepts"][0]["category"]=invalid
            with self.assertRaises(ValidationError):
                model.model_validate(data)

    def test_schemas_do_not_leak_categories_between_requests(self):
        first=to_strict_json_schema(extraction_schema([{"id":"1","label":"Pierwsza"}]))
        second=to_strict_json_schema(extraction_schema([{"id":"xyz","label":"Druga"}]))
        self.assertEqual(first["$defs"]["AllowedCategory"]["enum"],["1"])
        self.assertEqual(second["$defs"]["AllowedCategory"]["enum"],["xyz"])

    def test_dynamic_response_returns_plain_id(self):
        categories=[{"id":"4","label":"Inne"}]
        data={"status":"ok","concepts":[{"problem":"PDF","audience":"Czytelnik",
              "solution":"","category":"4","context":"","assessment":{"cost":3,"duration":3,"importance":3,"reach":3},"source_quote":"PDF"}]}
        client=Mock()
        client.responses.parse.return_value=SimpleNamespace(status="completed",
            output_parsed=extraction_schema(categories).model_validate(data))
        result=OpenAIExtractor(client,"test-model").extract("PDF",categories)
        self.assertIs(type(result.concepts[0].category),str)
        sent=to_strict_json_schema(client.responses.parse.call_args.kwargs["text_format"])
        self.assertEqual(sent["$defs"]["AllowedCategory"]["enum"],["4"])

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
        result = ExtractionResult(status="ok", concepts=[ExtractedConcept(
            problem="Problem", audience="Odbiorcy", solution="Działanie", category="invented",
            context="", assessment={"cost":3,"duration":3,"importance":3,"reach":3},source_quote="Pomysł")])
        client = Mock()
        client.responses.parse.return_value = SimpleNamespace(status="completed", output_parsed=result)
        with self.assertRaisesRegex(ExtractionError, "spoza listy"):
            OpenAIExtractor(client, "test-model").extract("Pomysł", [{"id": "allowed", "label": "Dozwolona"}])

    def test_no_category_catalog_endpoint(self):
        self.assertEqual(TestClient(create_app(Mock())).get("/api/categories").status_code, 404)
