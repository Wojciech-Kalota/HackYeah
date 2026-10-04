import argparse
import json
import os
import psycopg
from .errors import BusyError
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

from .database import Database
from .application_store import ApplicationStore
from .extraction import ExtractionError, OpenAIExtractor
from .retrieval import OpenAIEmbedder, Retriever
from .comparison import OpenAIComparator
from .pipeline import Pipeline


def main():
    parser = argparse.ArgumentParser(description="Analiza i wyszukiwanie koncepcji")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("index", help="Uzupełnij embeddingi istniejących koncepcji")
    search = sub.add_parser("search", help="Analiza tekstu i kandydaci; bez zapisu zgłoszenia")
    search.add_argument("file", type=Path)
    search.add_argument("--top-k", type=int, default=5, choices=range(1, 21))
    process = sub.add_parser("process", help="Pełny proces z porównaniem i zapisem")
    process.add_argument("file", type=Path)
    process.add_argument("--submission-id", required=True)
    process.add_argument("--author-id", required=True)
    process.add_argument("--district-id", required=True)
    search.add_argument("--categories", type=Path, required=True)
    process.add_argument("--categories", type=Path, required=True)
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    if not os.getenv("OPENAI_API_KEY", "").strip():
        print("Ustaw OPENAI_API_KEY w .env lub środowisku.", file=sys.stderr)
        return 1
    db = None
    try:
        db = Database()
        application = ApplicationStore(db)
        application.initialize()
        with OpenAI(timeout=60.0, max_retries=1) as client:
            retriever = Retriever(db, OpenAIEmbedder(client, os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")))
            if args.command == "index":
                with db.connection.transaction():
                    application.sync_existing()
                output = {"indexed": retriever.index_missing(), "total": len(db.list_concepts())}
            elif args.command == "process":
                model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
                pipeline = Pipeline(db, OpenAIExtractor(client, model), retriever,
                    OpenAIComparator(client, os.getenv("OPENAI_COMPARISON_MODEL", model)), application_store=application)
                output = pipeline.process(args.submission_id, args.file.read_text(encoding="utf-8-sig"), json.loads(args.categories.read_text(encoding="utf-8-sig")), {"author_id":args.author_id,"district_id":args.district_id})
            else:
                with db.connection.transaction():
                    application.sync_existing()
                retriever.index_missing()
                text = args.file.read_text(encoding="utf-8-sig")
                extraction = OpenAIExtractor(client, os.getenv("OPENAI_MODEL", "gpt-4.1-mini")).extract(text, json.loads(args.categories.read_text(encoding="utf-8-sig")))
                output = {"score":extraction.score(),"extraction": extraction.public_dump(), "matches": []}
                if extraction.status == "ok":
                    output["matches"] = [{"input_concept": c.public_dump(),
                        "candidates": retriever.search(c.to_concept(), args.top_k)} for c in extraction.concepts]
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return 0
    except ExtractionError as error:
        print(f"ExtractionError: {error}", file=sys.stderr)
        return 1
    except OpenAIError as error:
        print(f"Błąd OpenAI ({type(error).__name__}). Sprawdź połączenie, model i limity.", file=sys.stderr)
        return 1
    except (OSError, ValueError, psycopg.Error, BusyError) as error:
        # ValidationError może zawierać tekst użytkownika: nie drukujemy go.
        message = str(error) if type(error) is ValueError else type(error).__name__
        print(f"Błąd wyszukiwania: {message}", file=sys.stderr)
        return 1
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    raise SystemExit(main())
