import json
from pathlib import Path
from dotenv import load_dotenv

from .database import Database
from .models import Concept


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    db = Database()
    try:
        db.add_submission("zgloszenie-1", "Chcemy organizować rozmowy telefoniczne z seniorami.")
        concept_id = db.save_match(
            "zgloszenie-1",
            concept=Concept("Samotność", "Seniorzy", "Wolontariusz dzwoni raz w tygodniu",
                            "integracja_spoleczna", "Małopolska"),
            reason="Nowa koncepcja — przykład ręczny, bez analizy LLM",
        )
        db.add_submission("zgloszenie-2", "Wolontariusze będą co tydzień dzwonić do osób starszych.")
        for _ in range(2):
            db.save_match("zgloszenie-2", existing_id=concept_id,
                          reason="Ręcznie wskazane dopasowanie na potrzeby demonstracji")
        print(json.dumps(db.list_concepts(), ensure_ascii=False, indent=2))
    finally:
        db.close()


if __name__ == "__main__":
    main()
