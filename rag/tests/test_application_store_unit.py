from unittest import TestCase
from unittest.mock import Mock
from uuid import UUID, uuid4
from rops_rag.application_store import ApplicationStore

class ApplicationStoreUnitTests(TestCase):
    def test_save_writes_entity_and_link_with_bound_uuids(self):
        db = Mock()
        db.connection.execute.return_value = Mock()
        db.connection.execute.return_value.__iter__ = Mock(return_value=iter([]))
        db.connection.execute.return_value.fetchone.return_value = {"count": 1}
        store = ApplicationStore(db, schema="public", status_id=str(uuid4()))
        context = {"author_id":str(uuid4()),"district_id":str(uuid4()),"status_id":store.status_id}
        result = {"submission_id":"a", "replayed":False,"decisions":[{
            "concept_id":1,"decision":{"kind":"new"},"score":55,
            "input_concept":{"problem":"Problem","audience":"Odbiorcy","solution":"", "context":"", "category":str(uuid4())}}]}
        store.save(result,context)
        calls = db.connection.execute.call_args_list
        writes = [(call.args[0].as_string(),call.args[1]) for call in calls if not isinstance(call.args[0],str)]
        idea_write = next(values for query,values in writes if 'INSERT INTO "public"."Ideas"' in query)
        self.assertIsInstance(idea_write[0],UUID)
        self.assertEqual(idea_write[-1],55)
        self.assertEqual(idea_write[5],idea_write[6])
        self.assertEqual(result["contract_version"],4)
        self.assertEqual(result["decisions"][0]["liczba_zgloszen"],1)
        self.assertEqual(str(idea_write[0]),result["decisions"][0]["idea_id"])
        self.assertTrue(any('INSERT INTO "public"."IdeaCategories"' in query for query,_ in writes))
