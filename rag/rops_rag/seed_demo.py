from pathlib import Path
from dotenv import load_dotenv
from .database import Database
from .models import Concept

def main():
    load_dotenv(Path(__file__).resolve().parents[1]/".env")
    db=Database()
    examples=[
        Concept("Samotność","Seniorzy","Cotygodniowe rozmowy z wolontariuszem","integracja_spoleczna"),
        Concept("Wykluczenie cyfrowe","Seniorzy","Warsztaty smartfona w małych grupach","wlaczenie_cyfrowe")]
    try:
        for index,concept in enumerate(examples):
            sid=f"demo-{index}"
            if db.add_submission(sid,concept.retrieval_text()):
                db.save_match(sid,concept=concept,reason="Przykład demonstracyjny")
        print("Dodano przykłady demonstracyjne.")
    finally:
        db.close()

if __name__=="__main__":
    main()
