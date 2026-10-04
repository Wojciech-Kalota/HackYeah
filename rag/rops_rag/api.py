import os
import psycopg
from pathlib import Path
from uuid import UUID
from threading import Lock

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from .extraction import ExtractionError
from .errors import BusyError
from .categories import CategoryDefinition, validate_categories


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    submission_id: str = Field(min_length=1, max_length=200)
    author_id: str
    district_id: str
    text: str = Field(min_length=1, max_length=30000)
    categories: list[CategoryDefinition] = Field(min_length=1, max_length=100)

    @field_validator("author_id", "district_id")
    @classmethod
    def guid(cls, value):
        return str(UUID(value))

    @field_validator("categories")
    @classmethod
    def unique_categories(cls, value):
        validate_categories(value)
        return value

    @field_validator("submission_id", "text")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Pole nie może być puste")
        return value


class ServiceConfigurationError(RuntimeError):
    pass


def process_request(submission_id, text, categories, context):
    # Osobne połączenie PostgreSQL w tym samym wątku co cały proces.
    from openai import OpenAI, OpenAIError
    from .comparison import OpenAIComparator
    from .database import Database
    from .extraction import OpenAIExtractor
    from .pipeline import Pipeline
    from .application_store import ApplicationStore
    from .retrieval import OpenAIEmbedder, Retriever

    if not os.getenv("OPENAI_API_KEY", "").strip():
        raise ServiceConfigurationError("Brak konfiguracji OpenAI")
    if not os.getenv("APP_INITIAL_STATUS_ID", "").strip():
        raise ServiceConfigurationError("Brak APP_INITIAL_STATUS_ID")
    if not os.getenv("DATABASE_URL"):
        raise ServiceConfigurationError("Brak DATABASE_URL")
    db = Database()
    try:
        application = ApplicationStore(db)
        application.initialize()
        with OpenAI(timeout=60.0, max_retries=1) as client:
            model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
            retriever = Retriever(db, OpenAIEmbedder(client, os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")))
            pipeline = Pipeline(db, OpenAIExtractor(client, model), retriever,
                OpenAIComparator(client, os.getenv("OPENAI_COMPARISON_MODEL", model)), application_store=application)
            try:
                return pipeline.process(submission_id, text, categories, context)
            except OpenAIError as error:
                raise UpstreamError() from error
    finally:
        db.close()


class UpstreamError(RuntimeError):
    pass


def create_app(processor=None):
    app = FastAPI(title="ROPS RAG", version="0.1.0",
                  description="Ekstrakcja, wyszukiwanie, porównanie i zapis pomysłów")
    origins = [origin.strip() for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    ).split(",") if origin.strip()]
    if "*" in origins:
        raise ServiceConfigurationError("CORS_ORIGINS wymaga konkretnych adresów frontendu zamiast *")
    if origins:
        app.add_middleware(
            CORSMiddleware, allow_origins=origins, allow_credentials=False,
            allow_methods=["GET", "POST"], allow_headers=["Content-Type"],
            expose_headers=["Retry-After"],
        )
    gate = Lock()
    run = processor or process_request

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/api/ideas/analyze")
    def analyze(request: AnalyzeRequest):
        # Jedna analiza naraz. Nie blokujemy wątku oczekiwaniem w kolejce.
        if not gate.acquire(blocking=False):
            raise HTTPException(503, detail={"code": "busy", "message": "Analiza trwa. Ponów z tym samym ID."}, headers={"Retry-After": "5"})
        try:
            return run(request.submission_id, request.text, [item.model_dump() for item in request.categories],
                       {"author_id": request.author_id, "district_id": request.district_id})
        except ServiceConfigurationError:
            raise HTTPException(503, detail={"code": "configuration", "message": "Usługa wymaga OPENAI_API_KEY, DATABASE_URL i APP_INITIAL_STATUS_ID."})
        except UpstreamError:
            raise HTTPException(502, detail={"code": "openai_error", "message": "Wywołanie OpenAI nie powiodło się. Ponów z tym samym ID."})
        except ExtractionError as error:
            raise HTTPException(502, detail={"code": "model_output", "message": str(error)})
        except ValidationError:
            raise HTTPException(502, detail={"code": "model_output", "message": "Model zwrócił niespójne dane."})
        except ValueError as error:
            message = str(error)
            conflict = "identyfikator" in message or "bez wyniku procesu" in message
            raise HTTPException(409 if conflict else (422 if any(word in message for word in ("author_id", "district_id", "status_id", "UUID", "Kategoria", "Kategorie")) else 503), detail={
                "code": "submission_conflict" if conflict else "index_error", "message": message})
        except BusyError:
            raise HTTPException(503, detail={"code":"busy","message":"Inna analiza trwa. Ponów z tym samym ID."}, headers={"Retry-After":"5"})
        except psycopg.Error:
            raise HTTPException(503, detail={"code": "database_unavailable", "message": "Baza jest zajęta lub niedostępna. Ponów z tym samym ID."}, headers={"Retry-After": "5"})
        finally:
            gate.release()

    return app


def load_app():
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    return create_app()
