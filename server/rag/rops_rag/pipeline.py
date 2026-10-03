import json
from .errors import BusyError
from .categories import validate_categories

from .retrieval import text_hash, validate_vector


class Pipeline:
    def __init__(self, db, extractor, retriever, comparator):
        self.db, self.extractor = db, extractor
        self.retriever, self.comparator = retriever, comparator

    def process(self, submission_id, text, categories):
        categories = validate_categories(categories)
        categories = sorted(categories, key=lambda item: item["id"])
        if not isinstance(submission_id, str) or not submission_id.strip() or len(submission_id) > 200:
            raise ValueError("Identyfikator musi mieć od 1 do 200 znaków")
        if not isinstance(text, str) or not text.strip() or len(text) > 30000:
            raise ValueError("Opis musi mieć od 1 do 30 000 znaków")
        conn = self.db.connection
        # MVP: blokada transakcyjna PostgreSQL serializuje analizy, również API.
        # Dzięki temu druga analiza nie ominie koncepcji dodawanych przez pierwszą.
        conn.execute("BEGIN")
        try:
            if not conn.execute("SELECT pg_try_advisory_xact_lock(7248319501) AS acquired").fetchone()["acquired"]:
                raise BusyError("Inna analiza trwa")
            old = conn.execute("SELECT original_text FROM submissions WHERE id=%s", (submission_id,)).fetchone()
            if old:
                if old["original_text"] != text:
                    raise ValueError("Ten identyfikator należy do innego tekstu; dla zmienionego opisu użyj nowego ID")
                cached = conn.execute("SELECT result_json FROM processing_results WHERE submission_id=%s", (submission_id,)).fetchone()
                if cached:
                    result = json.loads(cached["result_json"])
                    if result.get("categories") != categories:
                        raise ValueError("Ten identyfikator należy do innej listy kategorii; użyj nowego ID")
                    result["replayed"] = True
                    conn.commit()
                    return result
                raise ValueError("Zgłoszenie istnieje bez wyniku procesu; użyj nowego ID")
            extraction = self.extractor.extract(text, categories)
            result = {"submission_id": submission_id, "replayed": False,
                      "categories": categories, "extraction": extraction.model_dump(), "decisions": []}
            conn.execute("INSERT INTO submissions (id, original_text) VALUES (%s, %s)", (submission_id, text))
            if extraction.status == "ok":
                for extracted in extraction.concepts:
                    if extracted.category not in {item["id"] for item in categories}:
                        raise ValueError("Kategoria spoza listy backendu")
                    concept = extracted.to_concept()
                    candidates = self.retriever.search(concept)
                    decision = self.comparator.compare(concept, candidates)
                    candidate_ids = {c["concept"]["id"] for c in candidates}
                    if decision.candidate_id is not None and decision.candidate_id not in candidate_ids:
                        raise ValueError("Decyzja wskazuje kandydata spoza wyników wyszukiwania")
                    cid = None
                    if decision.kind == "duplicate":
                        cid = decision.candidate_id
                    elif decision.kind in ("new", "similar"):
                        vector = self.retriever.embedder.embed(concept.retrieval_text())
                        validate_vector(vector)
                        cid = self.db.insert_concept(concept)
                        conn.execute("INSERT INTO concept_embeddings VALUES (%s,%s,%s,%s)",
                            (cid, self.retriever.embedder.model, text_hash(concept.retrieval_text()),
                             json.dumps(vector, allow_nan=False)))
                        if decision.kind == "similar":
                            conn.execute("INSERT INTO concept_relations VALUES (%s,%s,%s)", (cid, decision.candidate_id, decision.reason))
                    if cid is not None:
                        conn.execute("INSERT INTO submission_concepts VALUES (%s,%s,%s) "
                            "ON CONFLICT(submission_id,concept_id) DO NOTHING", (submission_id, cid, decision.reason))
                    result["decisions"].append({"input_concept": extracted.model_dump(),
                        "decision": decision.model_dump(), "concept_id": cid, "candidates": candidates})
            counts = {row["id"]: row["liczba_zgloszen"] for row in self.db.list_concepts()}
            for item in result["decisions"]:
                item["liczba_zgloszen"] = counts.get(item["concept_id"])
            conn.execute("INSERT INTO processing_results VALUES (%s,%s)", (submission_id, json.dumps(result, ensure_ascii=False)))
            conn.commit()
            return result
        except Exception:
            conn.rollback()
            raise
