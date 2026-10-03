from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import Mock
from pydantic import ValidationError
from rops_rag.comparison import Decision,OpenAIComparator,PROMPT
from rops_rag.models import Concept

class ComparisonTests(TestCase):
    def test_only_duplicate_and_new_are_valid(self):
        for kind in ("similar","needs_clarification"):
            with self.assertRaises(ValidationError):
                Decision(kind=kind,candidate_id=None,reason="Test")
        with self.assertRaises(ValidationError):
            Decision(kind="duplicate",candidate_id=None,reason="Test")
        with self.assertRaises(ValidationError):
            Decision(kind="new",candidate_id=1,reason="Test")

    def test_empty_solution_is_compared_and_similar_is_duplicate_policy(self):
        client=Mock()
        client.responses.parse.return_value=SimpleNamespace(status="completed",output_parsed=Decision(
            kind="duplicate",candidate_id=12,reason="Podobna potrzeba"))
        comparator=OpenAIComparator(client,"test-model")
        concept=Concept("Samotność","Seniorzy","","integration")
        decision=comparator.compare(concept,[{"concept":{"id":12},"similarity":0.9}])
        self.assertEqual(decision.kind,"duplicate")
        self.assertIn("identyczna lub podobna",PROMPT)
        self.assertIn("solution jest puste",PROMPT)
