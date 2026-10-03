from pg_support import test_database, close_test_database
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import Mock

from rops_rag.comparison import Decision, OpenAIComparator
from rops_rag.database import Database
from rops_rag.extraction import ExtractionError, ExtractionResult
from rops_rag.pipeline import Pipeline
from rops_rag.retrieval import Retriever


class PipelineTests(TestCase):
    def setUp(self):
        self.db = test_database()
        self.extractor, self.comparator = Mock(), Mock()
        self.embedder = Mock(model="test-model")
        self.embedder.embed.return_value = [1, 0]
        self.retriever = Retriever(self.db, self.embedder)
        self.pipeline = Pipeline(self.db, self.extractor, self.retriever, self.comparator)
        self.extractor.extract.return_value = ExtractionResult.model_validate({
            "status": "ok", "questions": [], "concepts": [{"problem": "Samotność",
            "audience": "Seniorzy", "solution": "Rozmowy telefoniczne", "category": "integracja_spoleczna",
            "context": "", "source_quote": "Pomysł"}]})
        self.comparator.compare.return_value = Decision(kind="new", candidate_id=None, reason="Nowy", questions=[])

    def tearDown(self):
        close_test_database(self.db)

    def test_new_then_duplicate_and_replay(self):
        first = self.pipeline.process("a", "Pomysł")
        cid = first["decisions"][0]["concept_id"]
        self.comparator.compare.return_value = Decision(kind="duplicate", candidate_id=cid, reason="Ten sam mechanizm", questions=[])
        second = self.pipeline.process("b", "Pomysł")
        self.assertEqual(second["decisions"][0]["liczba_zgloszen"], 2)
        calls = self.extractor.extract.call_count
        self.assertTrue(self.pipeline.process("b", "Pomysł")["replayed"])
        self.assertEqual(self.extractor.extract.call_count, calls)
        self.assertEqual(len(self.db.list_concepts()), 1)
        self.assertEqual(self.db.list_concepts()[0]["liczba_zgloszen"], 2)
        with self.assertRaises(ValueError):
            self.pipeline.process("b", "Zmieniony opis")

    def test_similar_creates_relation(self):
        cid = self.pipeline.process("a", "Pomysł")["decisions"][0]["concept_id"]
        self.comparator.compare.return_value = Decision(kind="similar", candidate_id=cid, reason="Inny mechanizm", questions=[])
        self.pipeline.process("b", "Pomysł")
        self.assertEqual(len(self.db.list_concepts()), 2)
        self.assertEqual(self.db.connection.execute("SELECT COUNT(*) FROM concept_relations").fetchone()["count"], 1)

    def test_failure_rolls_back_entire_submission(self):
        extraction = self.extractor.extract.return_value
        extraction.concepts.append(extraction.concepts[0].model_copy())
        self.comparator.compare.side_effect = [self.comparator.compare.return_value, ExtractionError("Przerwane API")]
        with self.assertRaises(ExtractionError):
            self.pipeline.process("a", "Pomysł")
        self.assertEqual(self.db.list_concepts(), [])
        for table in ("submissions", "concept_embeddings", "processing_results"):
            self.assertEqual(self.db.connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()["count"], 0)

    def test_clarification_does_not_add_concept(self):
        self.comparator.compare.return_value = Decision(kind="needs_clarification", candidate_id=None, reason="Brak danych", questions=["Jak działa?"])
        result = self.pipeline.process("a", "Pomysł")
        self.assertIsNone(result["decisions"][0]["concept_id"])
        self.assertEqual(self.db.list_concepts(), [])

    def test_invalid_candidate_is_rejected(self):
        self.comparator.compare.return_value = Decision(kind="duplicate", candidate_id=999, reason="Błąd", questions=[])
        with self.assertRaises(ValueError):
            self.pipeline.process("a", "Pomysł")
        self.assertEqual(self.db.list_concepts(), [])

    def test_postgres_lock_prevents_concurrent_processing(self):
        import os
        from rops_rag.errors import BusyError
        other = Database(os.environ["TEST_DATABASE_URL"], schema=self.db.schema)
        try:
            other.connection.execute("BEGIN")
            other.connection.execute("SELECT pg_advisory_xact_lock(7248319501)")
            with self.assertRaises(BusyError):
                self.pipeline.process("a", "Pomysł")
            self.extractor.extract.assert_not_called()
        finally:
            other.connection.rollback()
            other.close()

    def test_comparator_validates_candidate_id(self):
        client = Mock()
        client.responses.parse.return_value = SimpleNamespace(status="completed", output_parsed=Decision(
            kind="duplicate", candidate_id=999, reason="Błąd", questions=[]))
        comparator = OpenAIComparator(client, "test-model")
        concept = self.extractor.extract.return_value.concepts[0].to_concept()
        with self.assertRaises(ExtractionError):
            comparator.compare(concept, [{"concept": {"id": 1}, "similarity": 1}])
        self.assertEqual(comparator.compare(concept, []).kind, "new")
