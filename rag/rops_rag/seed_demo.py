"""Jawnie przykładowa baza. Nie są to zweryfikowane innowacje ROPS."""
from pathlib import Path
from dotenv import load_dotenv
from .database import Database
from .models import Concept


def main():
    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
    db = Database()
    examples = [
        Concept("Samotność", "Seniorzy", "Wolontariusz dzwoni co tydzień", "integracja_spoleczna", "Wsie Małopolski"),
        Concept("Wykluczenie cyfrowe", "Seniorzy", "Warsztaty smartfona w małych grupach z instruktorem", "wlaczenie_cyfrowe", "Małopolska"),
        Concept("Samotność", "Seniorzy", "Klub sąsiedzki: cotygodniowe spotkania w domu kultury", "integracja_spoleczna", "Małopolska"),
        Concept("Trudności w dotarciu do usług", "Osoby z ograniczoną mobilnością", "Transport do przychodni: wspólne przejazdy z koordynatorem", "transport_i_mobilnosc", "Obszary wiejskie"),
    ]
    try:
        for index, concept in enumerate(examples):
            sid = f"demo-{index}"
            if db.add_submission(sid, concept.retrieval_text()):
                db.save_match(sid, concept=concept, reason="Przykład demonstracyjny")
        print("PostgreSQL: dodano przykłady do schematu rops_rag.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
