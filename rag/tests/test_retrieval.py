from rag.tests.pg_support import test_database, close_test_database
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import Mock

from rag.rops_rag.database import Database
from rag.rops_rag.models import Concept
from rag.rops_rag.retrieval import OpenAIEmbedder, Retriever, cosine_similarity


class RetrievalTests(TestCase):
    def setUp(self):
        self.db = test_database()
        self.embedder = Mock(model="test-embedding")
        self.retriever = Retriever(self.db, self.embedder)
        self.concept = Concept(
            "Samotność",
            "Seniorzy",
            "Cotygodniowe rozmowy telefoniczne",
            "integracja_spoleczna",
        )

    def tearDown(self):
        close_test_database(self.db)

    def add(self, sid, concept):
        self.db.add_submission(sid, sid)
        return self.db.save_match(sid, concept=concept, reason="Test")

    def test_empty_database_has_no_candidates_or_embedding_calls(self):
        self.assertEqual(self.retriever.search(self.concept), [])
        self.embedder.embed.assert_not_called()

    def test_ranking_cache_and_counts(self):
        cid = self.add("a", self.concept)
        self.add(
            "b",
            Concept(
                "Transport", "Seniorzy", "Przejazdy autobusem", "transport_i_mobilnosc"
            ),
        )
        self.embedder.embed.side_effect = [[1, 0], [0, 1], [1, 0]]
        self.assertEqual(self.retriever.index_missing(), 2)
        self.assertEqual(self.retriever.index_missing(), 0)
        result = self.retriever.search(self.concept, top_k=1)
        self.assertEqual(result[0]["concept"]["id"], cid)
        self.assertAlmostEqual(result[0]["similarity"], 1)
        self.assertEqual(
            [r["liczba_zgloszen"] for r in self.db.list_concepts()], [1, 1]
        )

    def test_stale_and_changed_model_require_indexing(self):
        self.add("a", self.concept)
        with self.assertRaisesRegex(ValueError, "Indeks"):
            self.retriever.search(self.concept)
        self.embedder.embed.return_value = [1, 0]
        self.retriever.index_missing()
        self.embedder.model = "another-model"
        with self.assertRaisesRegex(ValueError, "Indeks"):
            self.retriever.search(self.concept)
        self.embedder.model = "test-embedding"
        with self.db.connection.transaction():
            self.db.connection.execute(
                "UPDATE concepts SET solution='Nowe rozwiązanie'"
            )
        with self.assertRaisesRegex(ValueError, "Indeks"):
            self.retriever.search(self.concept)
        self.assertEqual(self.retriever.index_missing(), 1)

    def test_invalid_vectors(self):
        for a, b in [
            ([1], [1, 0]),
            ([0, 0], [1, 0]),
            ([float("nan")], [1]),
            ([True], [1]),
        ]:
            with self.assertRaises(ValueError):
                cosine_similarity(a, b)

    def test_api_embedding_contract(self):
        client = Mock()
        client.embeddings.create.return_value = SimpleNamespace(
            data=[SimpleNamespace(embedding=[1.0, 0.0])]
        )
        embedder = OpenAIEmbedder(client)
        self.assertEqual(embedder.embed("Tekst"), [1.0, 0.0])
        client.embeddings.create.assert_called_once_with(
            model="text-embedding-3-small", input=["Tekst"]
        )
