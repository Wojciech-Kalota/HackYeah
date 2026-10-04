"""EF Core application tables on the SAME PostgreSQL connection as RAG."""
import os
from uuid import UUID
from psycopg import sql
from .models import Concept
from .entity_mapping import map_result_to_ideas


class ApplicationStore:
    def __init__(self, db, *, schema=None, status_id=None):
        self.db = db
        self.schema = schema or os.getenv("APP_DB_SCHEMA", "public")
        self.status_id = status_id or os.getenv("APP_INITIAL_STATUS_ID", "")
        db.application_schema = self.schema

    def table(self, name):
        return sql.Identifier(self.schema, name)

    def initialize(self):
        # EF migrations own application tables. Only add the requested Score.
        for name in ("Ideas", "IdeaCategories", "Categories", "Users", "Districts", "Statuses"):
            if not self.db.connection.execute("SELECT to_regclass(%s) AS name",
                    (f'{sql.Identifier(self.schema).as_string()}.{sql.Identifier(name).as_string()}',)).fetchone()["name"]:
                raise ValueError(f"Brak tabeli aplikacji {self.schema}.{name}; uruchom migracje EF")
        self.db.connection.execute(sql.SQL('ALTER TABLE {} ADD COLUMN IF NOT EXISTS "Score" DOUBLE PRECISION CHECK ("Score" BETWEEN 0 AND 100)').format(self.table("Ideas")))
        self.db.connection.execute("CREATE TABLE IF NOT EXISTS concept_idea_map (concept_id BIGINT PRIMARY KEY REFERENCES concepts(id), idea_id UUID NOT NULL UNIQUE)")
        self.db.connection.execute("CREATE TABLE IF NOT EXISTS submission_idea_map (submission_id TEXT NOT NULL REFERENCES submissions(id), concept_id BIGINT NOT NULL REFERENCES concepts(id), idea_id UUID NOT NULL UNIQUE, PRIMARY KEY(submission_id, idea_id))")

    def validate_context(self, context, categories):
        try:
            values = {"author_id": str(UUID(context["author_id"])),
                      "district_id": str(UUID(context["district_id"])),
                      "status_id": str(UUID(self.status_id))}
        except (ValueError, KeyError, TypeError) as error:
            raise ValueError("Wymagane poprawne UUID autora, obszaru i APP_INITIAL_STATUS_ID") from error
        for key, table in (("author_id", "Users"), ("district_id", "Districts"), ("status_id", "Statuses")):
            if not self.db.connection.execute(sql.SQL('SELECT "Id" FROM {} WHERE "Id"=%s').format(self.table(table)), (UUID(values[key]),)).fetchone():
                raise ValueError(f"Nie istnieje {key} w tabeli {table}")
        for item in categories:
            try:
                category_id = UUID(item["id"])
            except ValueError as error:
                raise ValueError("Kategorie muszą zawierać UUID z Categories.Id") from error
            row = self.db.connection.execute(sql.SQL('SELECT "Name" FROM {} WHERE "Id"=%s').format(self.table("Categories")), (category_id,)).fetchone()
            if not row or row["Name"] != item["label"]:
                raise ValueError("Kategoria nie istnieje lub jej etykieta nie odpowiada Categories.Name")
        return values

    def sync_existing(self):
        # Mirror existing root Ideas for retrieval; never invent authors/categories.
        rows = self.db.connection.execute(sql.SQL(
            'SELECT i."Id",i."Title",i."Description",i."CreatedAt",i."Score", '
            '(SELECT ic."CategoryId" FROM {} ic WHERE ic."IdeaId"=i."Id" ORDER BY ic."CategoryId" LIMIT 1) AS category_id '
            'FROM {} i WHERE i."DuplicateOfId" IS NULL'
        ).format(self.table("IdeaCategories"), self.table("Ideas"))).fetchall()
        for row in rows:
            mapped = self.db.connection.execute("SELECT concept_id FROM concept_idea_map WHERE idea_id=%s", (row["Id"],)).fetchone()
            if mapped:
                self.db.connection.execute("UPDATE concepts SET problem=%s,audience=%s,solution=%s,category=%s,context=%s,score=%s WHERE id=%s",
                    (row["Title"] or "Nie określono", "Nie określono", row["Description"], str(row["category_id"] or "uncategorized"), "", row["Score"], mapped["concept_id"]))
                continue
            concept = Concept(row["Title"] or "Nie określono", "Nie określono", row["Description"], str(row["category_id"] or "uncategorized"))
            cid = self.db.insert_concept(concept, score=row["Score"])
            self.db.connection.execute("INSERT INTO concept_idea_map VALUES (%s,%s)", (cid,row["Id"]))

    def save(self, result, context):
        mappings = {row["concept_id"]: str(row["idea_id"]) for row in self.db.connection.execute("SELECT * FROM concept_idea_map")}
        mapped = map_result_to_ideas(result, **context, concept_to_idea=mappings)
        for idea in mapped["ideas"]:
            columns = list(idea)
            values = [UUID(value) if key in ("Id","DuplicateOfId","DistrictId","StatusId","AuthorId") and value else value for key,value in idea.items()]
            self.db.connection.execute(sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(self.table("Ideas"), sql.SQL(",").join(map(sql.Identifier, columns)), sql.SQL(",").join(sql.Placeholder() for _ in columns)), values)
        for link in mapped["idea_categories"]:
            self.db.connection.execute(sql.SQL('INSERT INTO {} ("IdeaId","CategoryId") VALUES (%s,%s)').format(self.table("IdeaCategories")), (UUID(link["IdeaId"]),UUID(link["CategoryId"])))
        for cid, idea_id in mapped["concept_to_idea"].items():
            if cid not in mappings:
                self.db.connection.execute("INSERT INTO concept_idea_map VALUES (%s,%s)", (cid,UUID(idea_id)))
        for link in mapped["submission_idea_links"]:
            self.db.connection.execute("INSERT INTO submission_idea_map VALUES (%s,%s,%s)", (link["submission_id"],link["concept_id"],UUID(link["idea_id"])))
        for decision, idea in zip(result["decisions"], mapped["ideas"]):
            decision["idea_id"] = idea["Id"]
            decision["duplicate_of_id"] = idea["DuplicateOfId"]
            root = idea["DuplicateOfId"] or idea["Id"]
            decision["liczba_zgloszen"] = self.db.connection.execute(sql.SQL('SELECT COUNT(*)+1 AS count FROM {} WHERE "DuplicateOfId"=%s').format(self.table("Ideas")), (UUID(root),)).fetchone()["count"]
        result["application_context"] = context
        result["contract_version"] = 4
