from datetime import datetime, timezone
from unittest import TestCase
from uuid import uuid4
from rops_rag.entity_mapping import map_result_to_ideas

class MappingTests(TestCase):
    def setUp(self):
        self.category = str(uuid4())
        self.kwargs = dict(author_id=uuid4(), district_id=uuid4(), status_id=uuid4(),
            concept_to_idea={}, now=datetime(2026, 10, 4, tzinfo=timezone.utc))
        self.result = {"submission_id": "a", "replayed": False, "decisions": [{
            "concept_id": 12, "decision": {"kind": "new"}, "score": 70,
            "input_concept": {"problem": "Samotność", "audience": "Seniorzy",
                "solution": "", "context": "", "category": self.category}}]}

    def test_new_entity_and_dates(self):
        mapped = map_result_to_ideas(self.result, **self.kwargs)
        idea = mapped["ideas"][0]
        self.assertEqual(idea["CreatedAt"], idea["LastUpdatedAt"])
        self.assertEqual(idea["CreatedAt"], "2026-10-04T00:00:00+00:00")
        self.assertEqual(idea["Score"], 70)
        self.assertIsNone(idea["DuplicateOfId"])
        self.assertEqual(mapped["concept_to_idea"][12], idea["Id"])
        self.assertNotIn("Rozwiązanie:", idea["Description"])
        self.assertEqual(mapped["idea_categories"][0]["CategoryId"], self.category)

    def test_duplicate_uses_existing_uuid(self):
        target = str(uuid4())
        self.kwargs["concept_to_idea"] = {12: target}
        self.result["decisions"][0]["decision"]["kind"] = "duplicate"
        idea = map_result_to_ideas(self.result, **self.kwargs)["ideas"][0]
        self.assertEqual(idea["DuplicateOfId"], target)
        self.assertNotEqual(idea["Id"], target)

    def test_missing_mapping_and_replay_are_rejected(self):
        self.result["decisions"][0]["decision"]["kind"] = "duplicate"
        with self.assertRaises(ValueError):
            map_result_to_ideas(self.result, **self.kwargs)
        self.result["replayed"] = True
        with self.assertRaises(ValueError):
            map_result_to_ideas(self.result, **self.kwargs)

    def test_category_must_be_guid(self):
        self.result["decisions"][0]["input_concept"]["category"] = "1"
        with self.assertRaises(ValueError):
            map_result_to_ideas(self.result, **self.kwargs)
