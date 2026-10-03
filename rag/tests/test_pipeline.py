from unittest import TestCase
from unittest.mock import Mock
from pg_support import test_database,close_test_database
from rops_rag.pipeline import Pipeline
from rops_rag.retrieval import Retriever
from rops_rag.comparison import Decision
from rops_rag.extraction import ExtractionResult,ExtractionError

CATEGORIES=[{"id":"integration","label":"Integracja"}]

class PipelineTests(TestCase):
    def setUp(self):
        self.db=test_database()
        self.extractor,self.comparator,self.embedder=Mock(),Mock(),Mock(model="test-model")
        self.embedder.embed.return_value=[1,0]
        self.extractor.extract.return_value=ExtractionResult.model_validate({"status":"ok","concepts":[{
            "problem":"Samotność","audience":"Seniorzy","solution":"Rozmowy","category":"integration","context":"","assessment":{"cost":3,"duration":3,"importance":3,"reach":3},"source_quote":"Pomysł"}]})
        self.comparator.compare.return_value=Decision(kind="new",candidate_id=None,reason="Nowy")
        self.pipeline=Pipeline(self.db,self.extractor,Retriever(self.db,self.embedder),self.comparator)

    def tearDown(self):
        close_test_database(self.db)

    def test_new_duplicate_and_replay(self):
        first=self.pipeline.process("a","Pomysł",CATEGORIES)
        cid=first["decisions"][0]["concept_id"]
        self.comparator.compare.return_value=Decision(kind="duplicate",candidate_id=cid,reason="Ten sam")
        second=self.pipeline.process("b","Pomysł",CATEGORIES)
        self.assertEqual(second["decisions"][0]["liczba_zgloszen"],2)
        self.assertTrue(self.pipeline.process("b","Pomysł",CATEGORIES)["replayed"])
        self.assertEqual(self.extractor.extract.call_count,2)
        self.assertEqual(len(self.db.list_concepts()),1)

    def test_changed_categories_conflict(self):
        self.pipeline.process("a","Pomysł",CATEGORIES)
        with self.assertRaises(ValueError):
            self.pipeline.process("a","Pomysł",[{"id":"other","label":"Inne"}])

    def test_failure_rolls_back_all_writes(self):
        extraction=self.extractor.extract.return_value
        extraction.concepts.append(extraction.concepts[0].model_copy())
        self.comparator.compare.side_effect=[self.comparator.compare.return_value,ExtractionError("Przerwane")]
        with self.assertRaises(ExtractionError):
            self.pipeline.process("a","Pomysł",CATEGORIES)
        self.assertEqual(self.db.list_concepts(),[])
        self.assertEqual(self.db.connection.execute("SELECT COUNT(*) AS count FROM submissions").fetchone()["count"],0)

    def test_empty_solution_is_saved(self):
        self.extractor.extract.return_value.concepts[0].solution=""
        result=self.pipeline.process("a","Pomysł",CATEGORIES)
        self.assertEqual(result["decisions"][0]["decision"]["kind"],"new")
        self.assertEqual(self.db.list_concepts()[0]["solution"],"")
