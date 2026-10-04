"""Map RAG results to application entities without guessing physical SQL names."""
from datetime import datetime, timezone
from math import isfinite
from uuid import UUID, uuid4


def map_result_to_ideas(result, *, author_id, district_id, status_id,
                        concept_to_idea, now=None):
    """concept_to_idea maps internal BIGINT ids to existing application UUIDs.

    Returns entity payloads and newly established mappings. Does not write SQL.
    Caller must persist the mapping by submission_id and reuse it on retries.
    Author/status must come from trusted server context.
    """
    author, district, status = map(lambda value: str(UUID(str(value))),
                                  (author_id, district_id, status_id))
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now musi zawierać strefę czasową")
    timestamp = now.astimezone(timezone.utc).isoformat()
    if result.get("replayed"):
        raise ValueError("Ponowienie wymaga wcześniej zapisanego mapowania, nie nowych UUID")
    targets = {int(key): str(UUID(str(value))) for key, value in concept_to_idea.items()}
    ideas, categories, links = [], [], []
    for item in result["decisions"]:
        concept = item["input_concept"]
        category_id = str(UUID(concept["category"]))
        cid = item["concept_id"]
        kind = item["decision"]["kind"]
        if kind not in ("new", "duplicate"):
            raise ValueError("Nieobsługiwany rodzaj decyzji")
        duplicate_of = None
        if kind == "duplicate":
            if cid not in targets:
                raise ValueError(f"Brak mapowania concept_id={cid} na Idea.Id")
            duplicate_of = targets[cid]
        elif cid in targets:
            raise ValueError("Nowa koncepcja ma już mapowanie")
        score = item["score"]
        if isinstance(score, bool) or not isinstance(score, (int, float)) or not isfinite(score) or not 0 <= score <= 100:
            raise ValueError("Niepoprawny score")
        idea_id = str(uuid4())
        if kind == "new":
            targets[cid] = idea_id
        description = "\n\n".join(f"{label}: {concept[field]}" for label, field in (
            ("Problem", "problem"), ("Odbiorcy", "audience"),
            ("Rozwiązanie", "solution"), ("Kontekst", "context")) if concept[field])
        ideas.append({"Id": idea_id, "Title": concept["problem"],
            "Description": description, "ImageUrl": None, "DuplicateOfId": duplicate_of,
            "CreatedAt": timestamp, "LastUpdatedAt": timestamp,
            "DistrictId": district, "StatusId": status, "AuthorId": author, "Score": score})
        categories.append({"IdeaId": idea_id, "CategoryId": category_id})
        links.append({"submission_id": result["submission_id"], "concept_id": cid,
                      "idea_id": idea_id})
    return {"ideas": ideas, "idea_categories": categories,
            "submission_idea_links": links, "concept_to_idea": targets}
