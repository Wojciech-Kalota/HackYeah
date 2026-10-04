import json
import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError
from pydantic import ValidationError

from .extraction import ExtractionError, OpenAIExtractor


def main() -> int:
    parser = argparse.ArgumentParser(description="Wydziel koncepcje z opisu projektu (bez zapisu do bazy)")
    parser.add_argument("file", type=Path, help="Plik tekstowy UTF-8 z pomysłem")
    parser.add_argument("--categories", type=Path, required=True, help="JSON: lista kategorii projektu")
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    if not os.getenv("OPENAI_API_KEY", "").strip():
        print("Ustaw OPENAI_API_KEY w lokalnym .env lub w środowisku.", file=sys.stderr)
        return 1
    try:
        text = args.file.read_text(encoding="utf-8-sig")
        with OpenAI(timeout=60.0, max_retries=1) as client:
            result = OpenAIExtractor(client, os.getenv("OPENAI_MODEL", "gpt-4.1-mini")).extract(text, json.loads(args.categories.read_text(encoding="utf-8-sig")))
        print(json.dumps({"score":result.score(),**result.public_dump()},ensure_ascii=False,indent=2))
        return 0
    except ExtractionError as error:
        print(f"ExtractionError: {error}", file=sys.stderr)
        return 1
    except (OSError, ValueError, ValidationError) as error:
        print(f"Analiza nie powiodła się ({type(error).__name__}). Sprawdź plik i dane wejściowe.", file=sys.stderr)
        return 1
    except OpenAIError as error:
        print(f"Błąd OpenAI ({type(error).__name__}). Sprawdź klucz, model, połączenie i limity konta.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
