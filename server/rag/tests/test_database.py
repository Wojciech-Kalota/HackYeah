from pg_support import test_database, close_test_database
import psycopg
import unittest

from rops_rag.database import Database
from rops_rag.models import Concept


class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.db = test_database()
        self.concept = Concept("Samotność", "Seniorzy", "Cotygodniowe rozmowy telefoniczne", "integracja_spoleczna")
        self.db.add_submission("a", "Pomysł A")

    def tearDown(self):
        close_test_database(self.db)

    def test_independent_submissions_count_once_each(self):
        cid = self.db.save_match("a", concept=self.concept, reason="Nowy")
        self.db.add_submission("b", "Pomysł B")
        for _ in range(2):
            self.db.save_match("b", existing_id=cid, reason="To samo")
        self.assertEqual(self.db.list_concepts()[0]["liczba_zgloszen"], 2)

    def test_submission_retry_and_conflicting_text(self):
        self.assertFalse(self.db.add_submission("a", "Pomysł A"))
        with self.assertRaises(ValueError):
            self.db.add_submission("a", "Inny tekst")

    def test_failed_link_rolls_back_new_concept(self):
        with self.assertRaises(psycopg.IntegrityError):
            self.db.save_match("missing", concept=self.concept, reason="Nowy")
        self.assertEqual(self.db.list_concepts(), [])

    def test_nonexistent_concept_cannot_be_linked(self):
        with self.assertRaises(psycopg.IntegrityError):
            self.db.save_match("a", existing_id=999, reason="To samo")


if __name__ == "__main__":
    unittest.main()
