import os
import uuid
from unittest import SkipTest

from psycopg import sql
from rops_rag.database import Database


def test_database():
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        raise SkipTest("Ustaw TEST_DATABASE_URL, aby uruchomić testy PostgreSQL")
    return Database(url, schema="rops_test_" + uuid.uuid4().hex)


def close_test_database(db):
    # Usuwamy tylko utworzony przez ten test, losowy schemat.
    if not db.schema.startswith("rops_test_"):
        raise ValueError("Można usunąć wyłącznie schemat testowy")
    try:
        db.connection.rollback()
        db.connection.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(db.schema)))
    finally:
        db.close()
