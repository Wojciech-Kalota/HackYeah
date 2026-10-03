from unittest import TestCase
from pydantic import ValidationError
from rops_rag.scoring import Assessment
from rops_rag.extraction import ExtractedConcept,ExtractionResult
from rops_rag.extraction import OpenAIExtractor
from types import SimpleNamespace
from unittest.mock import Mock

class ScoringTests(TestCase):
    def test_range_and_neutral(self):
        self.assertEqual(Assessment(cost=1,duration=1,importance=5,reach=5).score(),100)
        self.assertEqual(Assessment(cost=5,duration=5,importance=1,reach=1).score(),0)
        self.assertEqual(Assessment(cost=3,duration=3,importance=3,reach=3).score(),50)

    def test_cost_and_duration_lower_score(self):
        base=dict(cost=2,duration=2,importance=4,reach=4)
        score=Assessment(**base).score()
        self.assertLess(Assessment(**{**base,"cost":3}).score(),score)
        self.assertLess(Assessment(**{**base,"duration":3}).score(),score)

    def test_invalid_values(self):
        for invalid in (0,6,True,2.5,"3"):
            with self.assertRaises(ValidationError):
                Assessment(cost=invalid,duration=3,importance=3,reach=3)

    def test_only_score_is_public(self):
        c=ExtractedConcept(problem="Problem",audience="Odbiorcy",solution="Pomysł",
            category="1",context="",source_quote="Pomysł",
            assessment=Assessment(cost=2,duration=3,importance=4,reach=3))
        result=ExtractionResult(status="ok",concepts=[c])
        public=result.public_dump()
        self.assertEqual(public["concepts"][0]["score"],65)
        self.assertNotIn("assessment",public["concepts"][0])
        self.assertNotIn("cost",str(public))
        self.assertEqual(c.to_concept().solution,"Pomysł")
        self.assertIsNone(ExtractionResult(status="no_concepts",concepts=[]).score())

    def test_empty_solution_uses_neutral_cost_and_duration(self):
        c=ExtractedConcept(problem="Problem",audience="Odbiorcy",solution="",
            category="1",context="",source_quote="Problem",
            assessment=Assessment(cost=1,duration=1,importance=3,reach=3))
        client=Mock()
        client.responses.parse.return_value=SimpleNamespace(status="completed",
            output_parsed=ExtractionResult(status="ok",concepts=[c]))
        result=OpenAIExtractor(client,"test-model").extract("Problem",[{"id":"1","label":"Inne"}])
        self.assertEqual(result.public_dump()["concepts"][0]["score"],50)
        self.assertEqual(result.concepts[0].assessment.cost,3)
        self.assertEqual(result.concepts[0].assessment.duration,3)

    def test_calibration_examples_match_formula(self):
        # Check numbers embedded in the rubric; this does not evaluate a live LLM.
        import re
        from rops_rag.scoring import SCORING_PROMPT
        examples = re.findall(
            r"cost=(\d), duration=(\d), importance=(\d), reach=(\d); score=([\d.]+)\.",
            SCORING_PROMPT,
        )
        self.assertEqual(len(examples), 5)
        scores = []
        for cost, duration, importance, reach, expected in examples:
            actual = Assessment(cost=int(cost), duration=int(duration),
                                importance=int(importance), reach=int(reach)).score()
            self.assertEqual(actual, float(expected))
            scores.append(actual)
        self.assertEqual(min(scores), 0)
        self.assertEqual(max(scores), 100)
