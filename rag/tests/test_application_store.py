import uuid
from unittest import TestCase
from unittest.mock import Mock
from psycopg import sql
from pg_support import test_database, close_test_database
from rops_rag.application_store import ApplicationStore
from rops_rag.pipeline import Pipeline
from rops_rag.retrieval import Retriever
from rops_rag.extraction import ExtractionResult, ExtractionError
from rops_rag.comparison import Decision

class ApplicationStoreTests(TestCase):
    def setUp(self):
        self.db = test_database()
        c = self.db.connection
        for table in ("Users", "Districts", "Statuses"):
            c.execute(sql.SQL('CREATE TABLE {} ("Id" UUID PRIMARY KEY)').format(sql.Identifier(table)))
        c.execute('CREATE TABLE "Categories" ("Id" UUID PRIMARY KEY,"Name" TEXT NOT NULL)')
        c.execute('CREATE TABLE "Ideas" ("Id" UUID PRIMARY KEY,"Title" TEXT NOT NULL,"Description" TEXT NOT NULL,"ImageUrl" TEXT,"DuplicateOfId" UUID REFERENCES "Ideas"("Id"),"CreatedAt" TIMESTAMPTZ NOT NULL,"LastUpdatedAt" TIMESTAMPTZ NOT NULL,"DistrictId" UUID NOT NULL REFERENCES "Districts"("Id"),"StatusId" UUID NOT NULL REFERENCES "Statuses"("Id"),"AuthorId" UUID NOT NULL REFERENCES "Users"("Id"))')
        c.execute('CREATE TABLE "IdeaCategories" ("IdeaId" UUID REFERENCES "Ideas"("Id"),"CategoryId" UUID REFERENCES "Categories"("Id"),PRIMARY KEY("CategoryId","IdeaId"))')
        author, district, status, category = [uuid.uuid4() for _ in range(4)]
        for table, value in (("Users",author),("Districts",district),("Statuses",status)):
            c.execute(sql.SQL('INSERT INTO {} VALUES (%s)').format(sql.Identifier(table)), (value,))
        c.execute('INSERT INTO "Categories" VALUES (%s,%s)', (category,"Integracja"))
        self.context = {"author_id":str(author),"district_id":str(district)}
        self.categories = [{"id":str(category),"label":"Integracja"}]
        self.application = ApplicationStore(self.db, schema=self.db.schema, status_id=str(status))
        self.application.initialize()
        self.extractor, self.comparator, self.embedder = Mock(), Mock(), Mock(model="test")
        self.embedder.embed.return_value = [1,0]
        self.extractor.extract.return_value = ExtractionResult.model_validate({"status":"ok","concepts":[{
            "problem":"Samotność","audience":"Seniorzy","solution":"Rozmowy","category":str(category),"context":"","source_quote":"Pomysł",
            "assessment":{"cost":3,"duration":3,"importance":3,"reach":3}}]})
        self.comparator.compare.return_value = Decision(kind="new",candidate_id=None,reason="Nowy")
        self.pipeline = Pipeline(self.db,self.extractor,Retriever(self.db,self.embedder),self.comparator,self.application)

    def tearDown(self):
        close_test_database(self.db)

    def test_write_duplicate_and_replay_are_atomic(self):
        first = self.pipeline.process("a","Pomysł",self.categories,self.context)
        self.assertEqual(first["contract_version"],4)
        cid = first["decisions"][0]["concept_id"]
        original = first["decisions"][0]["idea_id"]
        self.comparator.compare.return_value = Decision(kind="duplicate",candidate_id=cid,reason="Podobny")
        second = self.pipeline.process("b","Pomysł",self.categories,self.context)
        self.assertEqual(second["decisions"][0]["duplicate_of_id"],original)
        self.assertEqual(second["decisions"][0]["liczba_zgloszen"],2)
        replay = self.pipeline.process("b","Pomysł",self.categories,self.context)
        self.assertTrue(replay["replayed"])
        self.assertEqual(replay["decisions"][0]["idea_id"],second["decisions"][0]["idea_id"])
        self.assertEqual(self.db.connection.execute('SELECT COUNT(*) AS n FROM "Ideas"').fetchone()["n"],2)
        self.assertEqual(self.db.connection.execute('SELECT COUNT(*) AS n FROM "IdeaCategories"').fetchone()["n"],2)
        row = self.db.connection.execute('SELECT * FROM "Ideas" WHERE "Id"=%s',(uuid.UUID(original),)).fetchone()
        self.assertEqual(row["Score"],50)
        self.assertEqual(row["CreatedAt"],row["LastUpdatedAt"])

    def test_application_write_failure_rolls_back_rag(self):
        real = self.application.save
        def fail(result, context):
            real(result, context)
            raise ExtractionError("Przerwane po zapisie Idea")
        self.application.save = fail
        with self.assertRaises(ExtractionError):
            self.pipeline.process("a","Pomysł",self.categories,self.context)
        self.assertEqual(self.db.connection.execute('SELECT COUNT(*) AS n FROM "Ideas"').fetchone()["n"],0)
        self.assertEqual(self.db.connection.execute('SELECT COUNT(*) AS n FROM submissions').fetchone()["n"],0)

    def test_invalid_reference_does_not_call_openai(self):
        with self.assertRaises(ValueError):
            self.pipeline.process("a","Pomysł",self.categories,{**self.context,"author_id":str(uuid.uuid4())})
        self.extractor.extract.assert_not_called()
