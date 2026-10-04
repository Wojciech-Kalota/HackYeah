import json
from .errors import BusyError
from .categories import validate_categories
from .retrieval import text_hash, validate_vector


class Pipeline:
    def __init__(self, db, extractor, retriever, comparator):
        self.db, self.extractor = db, extractor
        self.retriever, self.comparator = retriever, comparator

    def process(self, submission_id, text, categories):
        categories = sorted(validate_categories(categories), key=lambda item: item["id"])
        if not isinstance(submission_id,str) or not submission_id.strip() or len(submission_id)>200:
            raise ValueError("Identyfikator musi mieć od 1 do 200 znaków")
        if not isinstance(text,str) or not text.strip() or len(text)>30000:
            raise ValueError("Opis musi mieć od 1 do 30 000 znaków")
        conn=self.db.connection
        conn.execute("BEGIN")
        try:
            if not conn.execute("SELECT pg_try_advisory_xact_lock(7248319501) AS acquired").fetchone()["acquired"]:
                raise BusyError("Inna analiza trwa")
            old=conn.execute("SELECT original_text FROM submissions WHERE id=%s",(submission_id,)).fetchone()
            if old:
                if old["original_text"]!=text:
                    raise ValueError("Ten identyfikator należy do innego tekstu; użyj nowego ID")
                cached=conn.execute("SELECT result_json FROM processing_results WHERE submission_id=%s",(submission_id,)).fetchone()
                if not cached:
                    raise ValueError("Zgłoszenie istnieje bez wyniku procesu; użyj nowego ID")
                result=json.loads(cached["result_json"])
                if result.get("contract_version") != 3:
                    raise ValueError("Zgłoszenie istnieje bez wyniku procesu zgodnego z kontraktem; użyj nowego ID")
                if result.get("categories")!=categories:
                    raise ValueError("Ten identyfikator należy do innej listy kategorii; użyj nowego ID")
                result["replayed"]=True
                conn.commit()
                return result
            extraction=self.extractor.extract(text,categories)
            result={"contract_version":3,"submission_id":submission_id,"replayed":False,"categories":categories,
                    "score":extraction.score(),"extraction":extraction.public_dump(),"decisions":[]}
            conn.execute("INSERT INTO submissions(id,original_text,score) VALUES (%s,%s,%s)",(submission_id,text,extraction.score()))
            if extraction.status=="ok":
                for extracted in extraction.concepts:
                    if extracted.category not in {item["id"] for item in categories}:
                        raise ValueError("Kategoria spoza listy kategorii żądania")
                    concept=extracted.to_concept()
                    candidates=self.retriever.search(concept)
                    decision=self.comparator.compare(concept,candidates)
                    if decision.candidate_id is not None and decision.candidate_id not in {item["concept"]["id"] for item in candidates}:
                        raise ValueError("Decyzja wskazuje kandydata spoza wyników wyszukiwania")
                    cid=None
                    if decision.kind=="duplicate":
                        cid=decision.candidate_id
                    elif decision.kind=="new":
                        vector=self.retriever.embedder.embed(concept.retrieval_text())
                        validate_vector(vector)
                        cid=self.db.insert_concept(concept, score=extracted.assessment.score())
                        conn.execute("INSERT INTO concept_embeddings VALUES (%s,%s,%s,%s)",
                            (cid,self.retriever.embedder.model,text_hash(concept.retrieval_text()),json.dumps(vector,allow_nan=False)))
                    if cid is not None:
                        canonical_submission_id=submission_id
                        if decision.kind=="duplicate":
                            canonical=conn.execute(
                                "SELECT sc.submission_id FROM submission_concepts sc "
                                "JOIN submissions s ON s.id=sc.submission_id "
                                "WHERE sc.concept_id=%s ORDER BY s.created_at, s.id LIMIT 1",
                                (cid,)).fetchone()
                            if canonical:
                                canonical_submission_id=canonical["submission_id"]
                        conn.execute("INSERT INTO submission_concepts(submission_id,concept_id,reason,score) VALUES (%s,%s,%s,%s) ON CONFLICT(submission_id,concept_id) DO NOTHING",(submission_id,cid,decision.reason,extracted.assessment.score()))
                    result["decisions"].append({"input_concept":extracted.public_dump(),
                        "score":extracted.assessment.score(),"decision":decision.model_dump(),"concept_id":cid,
                        "canonical_submission_id":canonical_submission_id if cid is not None else None,
                        "candidates":candidates})
            counts={row["id"]:row["liczba_zgloszen"] for row in self.db.list_concepts()}
            for item in result["decisions"]:
                item["liczba_zgloszen"]=counts.get(item["concept_id"])
            conn.execute("INSERT INTO processing_results VALUES (%s,%s)",(submission_id,json.dumps(result,ensure_ascii=False)))
            conn.commit()
            return result
        except Exception:
            conn.rollback()
            raise
