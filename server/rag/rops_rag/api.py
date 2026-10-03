import os
import psycopg
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from .extraction import ExtractionError
from .categories import CategoryDefinition, validate_categories
from .errors import BusyError


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    submission_id: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=30000)
    categories: list[CategoryDefinition] = Field(min_length=1, max_length=100)

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


def process_request(submission_id, text, categories):
    # Osobne połączenie PostgreSQL w tym samym wątku co cały proces.
    from openai import OpenAI, OpenAIError
    from .comparison import OpenAIComparator
    from .database import Database
    from .extraction import OpenAIExtractor
    from .pipeline import Pipeline
    from .retrieval import OpenAIEmbedder, Retriever

    if not os.getenv("OPENAI_API_KEY", "").strip():
        raise ServiceConfigurationError("Brak konfiguracji OpenAI")
    if not os.getenv("DATABASE_URL"):
        raise ServiceConfigurationError("Brak DATABASE_URL")
    db = Database()
    try:
        with OpenAI(timeout=60.0, max_retries=1) as client:
            model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
            retriever = Retriever(db, OpenAIEmbedder(client, os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")))
            pipeline = Pipeline(db, OpenAIExtractor(client, model), retriever,
                OpenAIComparator(client, os.getenv("OPENAI_COMPARISON_MODEL", model)))
            try:
                return pipeline.process(submission_id, text, categories)
            except OpenAIError as error:
                raise UpstreamError() from error
    finally:
        db.close()


class UpstreamError(RuntimeError):
    pass


def create_app(processor=None):
    app = FastAPI(title="ROPS RAG", version="0.1.0",
                  description="Ekstrakcja, wyszukiwanie, porównanie i zapis pomysłów")
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
            return run(request.submission_id, request.text, [item.model_dump() for item in request.categories])
        except ServiceConfigurationError:
            raise HTTPException(503, detail={"code": "configuration", "message": "Usługa wymaga OPENAI_API_KEY i DATABASE_URL."})
        except UpstreamError:
            raise HTTPException(502, detail={"code": "openai_error", "message": "Wywołanie OpenAI nie powiodło się. Ponów z tym samym ID."})
        except ExtractionError as error:
            raise HTTPException(502, detail={"code": "model_output", "message": str(error)})
        except ValidationError:
            raise HTTPException(502, detail={"code": "model_output", "message": "Model zwrócił niespójne dane."})
        except ValueError as error:
            message = str(error)
            conflict = "identyfikator" in message or "bez wyniku procesu" in message
            raise HTTPException(409 if conflict else 503, detail={
                "code": "submission_conflict" if conflict else "index_error", "message": message})
        except BusyError:
            raise HTTPException(503, detail={"code": "busy", "message": "Inna analiza trwa. Ponów z tym samym ID."}, headers={"Retry-After": "5"})
        except psycopg.Error:
            raise HTTPException(503, detail={"code": "database_unavailable", "message": "Baza jest zajęta lub niedostępna. Ponów z tym samym ID."}, headers={"Retry-After": "5"})
        finally:
            gate.release()

    return app


def load_app():
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    return create_app()
