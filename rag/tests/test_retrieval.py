from unittest import TestCase
from unittest.mock import Mock
from rops_rag.models import Concept
from rops_rag.retrieval import Retriever, cosine_similarity, text_hash
import json

class RetrievalTests(TestCase):
    def setUp(self):
        self.db = Mock()
        self.embedder = Mock(model="test-model")
        self.concept = Concept("Problem","Odbiorcy","Rozwiązanie","category")
        self.row = {"id":1,"problem":"Problem","audience":"Odbiorcy","solution":"Rozwiązanie","category":"category","context":""}
        self.retriever = Retriever(self.db,self.embedder)

    def test_missing_embedding_requires_index(self):
        self.db.list_concepts.return_value=[self.row]
        self.db.connection.execute.return_value=[]
        with self.assertRaisesRegex(ValueError,"Indeks"):
            self.retriever.search(self.concept)
        self.embedder.embed.assert_not_called()

    def test_saved_embedding_reused(self):
        self.db.list_concepts.return_value = [self.row]
        self.db.connection.execute.return_value = [{"concept_id":1,"text_hash":text_hash(self.concept.retrieval_text()),"vector_json":json.dumps([1,0])}]
        self.embedder.embed.return_value = [1,0]
        self.retriever.search(self.concept)
        self.embedder.embed.assert_called_once()

    def test_empty_database(self):
        self.db.list_concepts.return_value = []
        self.assertEqual(self.retriever.search(self.concept),[])
        self.embedder.embed.assert_not_called()

    def test_invalid_vectors(self):
        for a,b in [([0,0],[1,0]),([1],[1,0]),([float("nan")],[1])]:
            with self.assertRaises(ValueError):
                cosine_similarity(a,b)
