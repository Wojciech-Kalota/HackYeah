# Kontrakt API — zapis do eInicjatywa

POST /api/ideas/analyze, JSON UTF-8. Frontend wywołuje Python bezpośrednio.

```json
{
  "submission_id": "test-application-001",
  "author_id": "00000000-0000-4000-8000-000000000001",
  "district_id": "00000000-0000-4000-8000-000000000002",
  "text": "Wolontariusze będą dzwonić do samotnych seniorów.",
  "categories": [{"id":"00000000-0000-4000-8000-000000000003","label":"Integracja"}]
}
```

UUID w przykładzie należy zastąpić rekordami istniejącymi w bazie aplikacji.
Wszystkie pola wymagane. submission_id: string 1–200 znaków, text: 1–30000.
Kategorie: 1–100 elementów; unikalne id, etykieta 1–200 znaków bez skrajnych
spacji. Kategorie muszą mieć UUID z Categories.Id i label zgodne z Name.
Autor i obszar muszą istnieć. Statusu nie wysyłamy: APP_INITIAL_STATUS_ID jest
ustawiany na serwerze. Dodatkowe pola są odrzucane.

## Odpowiedź

contract_version=4. Główne pola: submission_id, replayed, categories, score,
application_context, extraction oraz decisions.

extraction.status: ok lub no_concepts; concepts zawiera problem, audience,
solution, category, context, source_quote i score. Niejasne rozwiązanie to "".
Przy no_concepts concepts i decisions są puste, score=null.

Każdy element decisions zawiera:

| Pole | Znaczenie |
|---|---|
| input_concept | Wyodrębniona koncepcja |
| score | Ocena koncepcji 0–100 |
| decision | kind: new/duplicate, candidate_id: BIGINT lub null, reason |
| concept_id | Wewnętrzny BIGINT RAG |
| idea_id | UUID nowego rekordu Ideas, także dla duplikatu |
| duplicate_of_id | UUID oryginalnego Idea lub null |
| candidates | Do 5 kandydatów {concept, similarity} |
| liczba_zgloszen | Oryginał + liczba duplikatów w Ideas |

Kandydat concept ma id (wewnętrzny BIGINT), idea_id (UUID aplikacji), problem,
audience, solution, category, context, created_at, score i liczba_zgloszen.
Similarity wynosi -1..1 i nie jest prawdopodobieństwem. Na frontendzie używaj
idea_id do odwołań do aplikacji; concept_id i candidate_id dotyczą indeksu RAG.
application_context zawiera author_id, district_id i status_id jako UUID.

Score zgłoszenia jest średnią ocen koncepcji. Oceny składowe nie są zwracane.
Wzór: round(25 * [0.4*(W-1)+0.3*(Z-1)+0.2*(5-K)+0.1*(5-T)],1).
W, Z, K, T to ważność, zasięg, koszt i czas ocenione 1–5. Score nie zależy od
licznika. Ideas.Score zawiera ocenę tej koncepcji, nie średnią całego zgłoszenia.

## Ponawianie

Frontend generuje crypto.randomUUID() raz dla zgłoszenia i zachowuje całe
żądanie na czas ponowień. Ten sam submission_id, tekst, kategorie i kontekst
zwracają zapisany wynik replayed=true bez kolejnych zapisów i wywołań OpenAI.
Zmiana danych wymaga nowego ID. Po timeout analiza może nadal trwać; ponów
z tym samym ID. Liczniki replay są historyczne. Wcześniejsze zapisane wyniki
innego kontraktu wymagają nowego submission_id.

## Błędy i CORS

409: konflikt ID. 422: nieprawidłowe dane lub nieistniejące odwołania.
502: OpenAI / wynik modelu. 503: konfiguracja, baza, zajętość lub indeks.
Walidacja FastAPI zwraca listę w detail; błędy usługi obiekt {code,message}.
Retry-After jest udostępniony przeglądarce. Jedna analiza naraz.

CORS_ORIGINS: adresy frontendu rozdzielone przecinkami; bez ścieżek.
Domyślnie localhost i 127.0.0.1 na portach 5173 i 3000; pusta wartość wyłącza
CORS. Restart po zmianie. GET /health potwierdza działanie procesu, nie bazę.

Klient: [ragClient.js](../examples/ragClient.js). MVP nie uwierzytelnia autora:
sprawdza istnienie UUID, ale nie własność sesji. Przy udostępnieniu publicznym
należy połączyć API z uwierzytelnianiem aplikacji.
