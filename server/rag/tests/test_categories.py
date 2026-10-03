from unittest import TestCase
from unittest.mock import Mock

from fastapi.testclient import TestClient
from pydantic import ValidationError
from openai.lib._pydantic import to_strict_json_schema

from rops_rag.api import create_app
from rops_rag.categories import Category, category_catalog
from rops_rag.extraction import ExtractedConcept, ExtractionResult
from rops_rag.models import Concept


class CategoryTests(TestCase):
    def data(self):
        return dict(problem="Samotność", audience="Seniorzy",
                    solution="Wolontariusz dzwoni co tydzień", category="integracja_spoleczna",
                    context="", source_quote="Wolontariusz dzwoni co tydzień")

    def test_combined_solution_and_category(self):
        extracted = ExtractedConcept(**self.data())
        concept = extracted.to_concept()
        self.assertEqual(concept.category, Category.INTEGRATION)
        self.assertNotIn("mechanism", extracted.model_dump())
        self.assertIn(concept.solution, concept.retrieval_text())

    def test_unknown_category_and_old_field_rejected(self):
        data = self.data()
        data["category"] = "nowa_kategoria"
        with self.assertRaises(ValidationError):
            ExtractedConcept(**data)
        with self.assertRaises(ValidationError):
            ExtractedConcept(**self.data(), mechanism="Stare pole")
        with self.assertRaises(ValueError):
            Concept("Problem", "Odbiorcy", "Działanie", "nieznana")

    def test_sdk_schema_has_enum(self):
        schema = to_strict_json_schema(ExtractionResult)
        self.assertEqual(set(schema["$defs"]["Category"]["enum"]), {c.value for c in Category})

    def test_categories_endpoint_without_openai(self):
        processor = Mock()
        response = TestClient(create_app(processor)).get("/api/categories")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), category_catalog())
        processor.assert_not_called()
