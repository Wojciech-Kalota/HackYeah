from unittest import TestCase
from unittest.mock import Mock
import psycopg
from fastapi.testclient import TestClient
from rops_rag.api import create_app

class IdeasApiTests(TestCase):
    def setUp(self):
        self.db = Mock()
        self.factory = Mock(return_value=self.db)
        self.processor = Mock()
        self.client = TestClient(create_app(self.processor, database_factory=self.factory))

    def test_list_filter_and_pagination(self):
        payload = {"items":[{"id":42,"score":70,"liczba_zgloszen":2}],"total":1,"limit":10,"offset":0}
        self.db.get_concepts_page.return_value = payload
        response = self.client.get("/api/ideas?limit=10&offset=0&category=custom")
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json(),payload)
        self.db.get_concepts_page.assert_called_once_with(limit=10,offset=0,category="custom")
        self.db.close.assert_called_once()
        self.processor.assert_not_called()

    def test_detail_and_missing(self):
        self.db.get_concept.return_value = {"id":42,"score":None}
        self.assertEqual(self.client.get("/api/ideas/42").json(),{"id":42,"score":None})
        self.db.get_concept.assert_called_once_with(42)
        self.db.get_concept.return_value = None
        self.assertEqual(self.client.get("/api/ideas/43").status_code,404)

    def test_invalid_parameters_do_not_open_database(self):
        for url in ("/api/ideas?limit=0","/api/ideas?limit=101","/api/ideas?offset=-1",
                    "/api/ideas?category=","/api/ideas/0","/api/ideas/9223372036854775808"):
            self.assertEqual(self.client.get(url).status_code,422)
        self.factory.assert_not_called()

    def test_database_error_closes_connection(self):
        self.db.get_concepts_page.side_effect = psycopg.OperationalError("unavailable")
        response = self.client.get("/api/ideas")
        self.assertEqual(response.status_code,503)
        self.db.close.assert_called_once()
        self.assertNotIn("unavailable",response.json()["detail"]["message"])
