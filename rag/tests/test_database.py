from unittest import TestCase
import psycopg
from pg_support import test_database,close_test_database
from rops_rag.models import Concept

class DatabaseTests(TestCase):
    def setUp(self):
        self.db=test_database()
    def tearDown(self):
        close_test_database(self.db)
    def test_links_count_once(self):
        self.db.add_submission("a","Pomysł")
        cid=self.db.save_match("a",concept=Concept("Problem","Odbiorcy","Rozwiązanie","custom"),reason="Nowy")
        self.db.save_match("a",existing_id=cid,reason="Ponowienie")
        self.assertEqual(self.db.list_concepts()[0]["liczba_zgloszen"],1)
    def test_failed_link_rolls_back_concept(self):
        with self.assertRaises(psycopg.IntegrityError):
            self.db.save_match("missing",concept=Concept("Problem","Odbiorcy","Rozwiązanie","custom"),reason="Nowy")
        self.assertEqual(self.db.list_concepts(),[])
