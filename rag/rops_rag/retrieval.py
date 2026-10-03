import hashlib
import json
import math

from .models import Concept


def validate_vector(vector):
    if not vector or any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in vector):
        raise ValueError("Embedding musi zawierać skończone liczby")
    norm = math.hypot(*vector)
    if not math.isfinite(norm) or norm == 0:
        raise ValueError("Embedding ma niepoprawną długość")
    return norm


def cosine_similarity(a, b):
    if len(a) != len(b):
        raise ValueError("Embeddingi mają różne wymiary; przebuduj indeks")
    na, nb = validate_vector(a), validate_vector(b)
    return max(-1.0, min(1.0, math.fsum((x / na) * (y / nb) for x, y in zip(a, b))))


def row_concept(row):
    return Concept(**{key: row[key] for key in ("problem", "audience", "solution", "category", "context")})


def text_hash(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class OpenAIEmbedder:
    def __init__(self, client, model="text-embedding-3-small"):
        if not model.strip():
            raise ValueError("Nazwa modelu embeddingów jest wymagana")
        self.client, self.model = client, model

    def embed(self, text):
        if not text.strip():
            raise ValueError("Tekst embeddingu nie może być pusty")
        response = self.client.embeddings.create(model=self.model, input=[text])
        if len(response.data) != 1:
            raise ValueError("OpenAI zwróciło niepoprawną liczbę embeddingów")
        vector = response.data[0].embedding
        validate_vector(vector)
        return vector


class Retriever:
    def __init__(self, db, embedder):
        self.db, self.embedder = db, embedder

    def index_missing(self):
        """Indeksuje brakujące/zmienione rekordy; nie zmienia liczników."""
        updated = 0
        for row in self.db.list_concepts():
            text = row_concept(row).retrieval_text()
            digest = text_hash(text)
            stored = self.db.connection.execute(
                "SELECT text_hash FROM concept_embeddings WHERE concept_id=%s AND model=%s",
                (row["id"], self.embedder.model),
            ).fetchone()
            if stored and stored["text_hash"] == digest:
                continue
            vector = self.embedder.embed(text)
            validate_vector(vector)
            with self.db.connection.transaction():
                self.db.connection.execute(
                    "INSERT INTO concept_embeddings VALUES (%s, %s, %s, %s) "
                    "ON CONFLICT(concept_id, model) DO UPDATE SET "
                    "text_hash=excluded.text_hash, vector_json=excluded.vector_json",
                    (row["id"], self.embedder.model, digest, json.dumps(vector, allow_nan=False)),
                )
            updated += 1
        return updated

    def search(self, concept: Concept, top_k=5):
        if isinstance(top_k, bool) or not isinstance(top_k, int) or not 1 <= top_k <= 20:
            raise ValueError("top_k musi wynosić od 1 do 20")
        rows = self.db.list_concepts()
        if not rows:
            return []
        stored = {row["concept_id"]: row for row in self.db.connection.execute(
            "SELECT * FROM concept_embeddings WHERE model=%s", (self.embedder.model,)
        )}
        for row in rows:
            item = stored.get(row["id"])
            if item is None or item["text_hash"] != text_hash(row_concept(row).retrieval_text()):
                raise ValueError("Indeks niekompletny lub nieaktualny; uruchom polecenie index")
        query_vector = self.embedder.embed(concept.retrieval_text())
        results = [{"concept": row, "similarity": cosine_similarity(
            query_vector, json.loads(stored[row["id"]]["vector_json"])
        )} for row in rows]
        return sorted(results, key=lambda item: (-item["similarity"], item["concept"]["id"]))[:top_k]
