from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import Mock

from pydantic import ValidationError

from rops_rag.extraction import ExtractionError, ExtractionResult, OpenAIExtractor


class ExtractionTests(TestCase):
    def setUp(self):
        self.text = "Wolontariusze dzwonią do seniorów co tydzień."
        self.data = {"status": "ok", "questions": [], "concepts": [{
            "problem": "Samotność", "audience": "Seniorzy", "solution": "Rozmowy",
            "category": "integracja_spoleczna", "context": "",
            "source_quote": self.text,
        }]}
        self.client = Mock()
        self.extractor = OpenAIExtractor(self.client, "test-model")

    def respond(self, result, status="completed"):
        self.client.responses.parse.return_value = SimpleNamespace(status=status, output_parsed=result)

    def test_extraction_and_conversion(self):
        self.respond(ExtractionResult.model_validate(self.data))
        result = self.extractor.extract(self.text)
        self.assertEqual(result.concepts[0].to_concept().audience, "Seniorzy")
        kwargs = self.client.responses.parse.call_args.kwargs
        self.assertFalse(kwargs["store"])
        self.assertEqual(kwargs["input"][1]["content"], self.text)

    def test_fabricated_quote_rejected(self):
        self.data["concepts"][0]["source_quote"] = "Nie ma tego w tekście"
        self.respond(ExtractionResult.model_validate(self.data))
        with self.assertRaises(ExtractionError):
            self.extractor.extract(self.text)

    def test_whitespace_changes_restore_original_quote(self):
        source = "Wolontariusze\r\n  dzwonią do seniorów co tydzień."
        self.respond(ExtractionResult.model_validate(self.data))
        result = self.extractor.extract(source)
        self.assertEqual(result.concepts[0].source_quote, source)

    def test_paraphrase_is_not_accepted(self):
        self.data["concepts"][0]["source_quote"] = "Wolontariusze telefonują do seniorów co tydzień."
        self.respond(ExtractionResult.model_validate(self.data))
        with self.assertRaisesRegex(ExtractionError, "Koncepcja 1"):
            self.extractor.extract(self.text)

    def test_token_limit_has_specific_message(self):
        self.client.responses.parse.return_value = SimpleNamespace(
            status="incomplete", output_parsed=None,
            incomplete_details=SimpleNamespace(reason="max_output_tokens"),
        )
        with self.assertRaisesRegex(ExtractionError, "limit tokenów"):
            self.extractor.extract(self.text)

    def test_refusal_has_specific_message(self):
        self.client.responses.parse.return_value = SimpleNamespace(
            status="completed", output_parsed=None,
            output=[SimpleNamespace(content=[SimpleNamespace(type="refusal")])],
        )
        with self.assertRaisesRegex(ExtractionError, "odmówił"):
            self.extractor.extract(self.text)

    def test_refusal_or_incomplete_output_rejected(self):
        for status, result in [("completed", None), ("incomplete", ExtractionResult.model_validate(self.data))]:
            with self.subTest(status=status):
                self.respond(result, status)
                with self.assertRaises(ExtractionError):
                    self.extractor.extract(self.text)

    def test_invalid_input_does_not_call_api(self):
        for text in [" ", "x" * 30001]:
            with self.assertRaises(ValueError):
                self.extractor.extract(text)
        self.client.responses.parse.assert_not_called()

    def test_status_consistency(self):
        with self.assertRaises(ValidationError):
            ExtractionResult(status="ok", concepts=[], questions=[])
        with self.assertRaises(ValidationError):
            ExtractionResult(status="needs_clarification", concepts=[], questions=[])
        result = ExtractionResult(status="needs_clarification", concepts=[], questions=["Jakie działanie proponujesz?"])
        self.assertEqual(result.concepts, [])
