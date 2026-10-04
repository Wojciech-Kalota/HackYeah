# Kontrakt API — ROPS RAG

Adres: http://127.0.0.1:8000. JSON UTF-8. Swagger: /docs.
Python wykonuje analizę i zapis w PostgreSQL. Frontend wywołuje API bezpośrednio.

## POST /api/ideas/analyze

```json
{
  "submission_id":"test-001",
  "text":"Wolontariusze będą co tydzień dzwonić do samotnych seniorów.",
  "categories":[{"id":"1","label":"Integracja społeczna"}]
}
```

Wszystkie pola wymagane. submission_id: string 1–200 znaków, text: string
1–30 000. categories: 1–100 elementów; unikalne tekstowe id 1–100 znaków,
label 1–200 znaków, bez pustych/skrajnych spacji. Dodatkowe pola odrzucamy.
Frontend pobiera kategorie ze źródła kategorii projektu i przesyła je w POST.
RAG nie udostępnia listy kategorii. Frontend generuje submission_id przez
crypto.randomUUID() raz dla zgłoszenia; ponowienia używają tego samego ID i danych.

## Odpowiedź 200

```json
{
  "contract_version":3,
  "score":65.0,
  "submission_id":"test-001",
  "replayed":false,
  "categories":[{"id":"1","label":"Integracja społeczna"}],
  "extraction":{
    "status":"ok",
    "concepts":[{
      "problem":"Samotność","audience":"Seniorzy",
      "solution":"Cotygodniowe rozmowy z wolontariuszem.",
      "category":"1","context":"","score":65.0,
      "source_quote":"Wolontariusze będą co tydzień dzwonić do samotnych seniorów."
    }]
  },
  "decisions":[{
    "input_concept":{
      "problem":"Samotność","audience":"Seniorzy",
      "solution":"Cotygodniowe rozmowy z wolontariuszem.",
      "category":"1","context":"","score":65.0,
      "source_quote":"Wolontariusze będą co tydzień dzwonić do samotnych seniorów."
    },
    "decision":{"kind":"new","candidate_id":null,"reason":"Brak odpowiednika."},
    "score":65.0,
    "concept_id":42,
    "canonical_submission_id":"test-001",
    "candidates":[],
    "liczba_zgloszen":1
  }]
}
```

extraction.status: ok / no_concepts. Przy no_concepts lista concepts oraz
decisions są puste; nie powstaje koncepcja. Nie ma pytań doprecyzowujących.

| decision.kind | Wynik zapisu |
| --- | --- |
| duplicate | Powiązanie z identyczną lub podobną koncepcją; licznik +1 |
| new | Nowy rekord, licznik 1 |

solution jest tekstem i może być dokładnie "", jeśli rozwiązanie jest niejasne
albo nie zostało podane. Taka koncepcja jest wyszukiwana i porównywana na bazie
problemu, odbiorców i kontekstu, a następnie zapisywana lub powiązana.
Przy duplicate zachowujemy dane istniejącej koncepcji; input_concept pokazuje
opis zgłoszenia i może mieć puste solution.
candidate_id jest ID kandydata dla duplicate, dla new null.
concept_id to ID przypisanej koncepcji; liczba_zgloszen to licznik po przetworzeniu.
canonical_submission_id wskazuje pierwsze zgłoszenie przypisane do koncepcji.
Frontend używa go jako DuplicateOfId przy zapisie duplikatu w głównym API.
ID koncepcji i liczniki to liczby całkowite; ID kategorii są string.
JavaScript zachowuje dokładność liczb całkowitych do Number.MAX_SAFE_INTEGER.
contract_version=3 oznacza ten format odpowiedzi.

### Score

`score` jest liczbą 0–100, z jednym miejscem po przecinku. Występuje dla
każdej koncepcji i decyzji oraz na poziomie całego zgłoszenia (średnia ocen
koncepcji). Przy no_concepts score zgłoszenia jest null. Frontend otrzymuje number lub null. Oceny składowe nie są zwracane.

LLM wewnętrznie ocenia cztery wymiary w skali 1–5: koszt (K), czas do
pilotażu (T), znaczenie społeczne (W), zasięg korzyści (Z).
Wzór w Pythonie:

```text
score = round(25 × [0.4 × (W−1) + 0.3 × (Z−1) + 0.2 × (5−K) + 0.1 × (5−T)], 1)
```

Niższy koszt i krótszy czas podnoszą wynik. Znaczenie społeczne ma wagę 40%,
zasięg 30%, koszt 20%, czas 10%. Są to założenia MVP, wymagające kalibracji
na ocenionych przykładach. Score jest orientacyjnym priorytetem, nie wyceną,
prognozą czasu ani oceną skuteczności. Nie zależy od licznika zgłoszeń.
Nieznany koszt/czas przyjmuje 3; nieokreślony zasięg i brak konkretnej szkody
przyjmują 2. Przy pustym solution koszt i czas wynoszą 3.
Ocena dotyczy bieżącego zgłoszenia, także gdy zostanie dopasowane jako duplikat.

candidates zawiera do pięciu {concept,similarity}. concept zawiera id,
problem, audience, solution, category, context, created_at i liczba_zgloszen.
created_at to ISO 8601 ze strefą (string). similarity to number -1..1,
nie procent pewności. Kategorie kandydatów mogą być historyczne.
solution opisuje rozwiązanie wraz ze sposobem działania.

## Ponawianie z frontendu

Ten sam submission_id, dokładnie ten sam tekst i kategorie zwracają zachowany
wynik z replayed=true, bez API i zmian licznika. Kolejność kategorii nie ma
znaczenia; zmiana ID/etykiety lub tekstu to konflikt 409.
Frontend nie wykonuje dodatkowego zapisu koncepcji ani zwiększania liczników.
Po timeout analiza może nadal trwać: ponów z tym samym ID i danymi.
Liczniki w odpowiedzi replay są historyczne, nie są odświeżane.
Przykład fetch: [ragClient.js](../examples/ragClient.js), timeout 15 minut.
Zachowaj żądanie przy błędzie sieci/timeout oraz 502/503. Nie twórz nowego UUID
dla ponowienia. Przy zmianie treści lub kategorii utwórz nowe zgłoszenie.

## GET /health

200: {"status":"ok"}. Sprawdza proces, nie PostgreSQL ani OpenAI.

## Błędy

409 konflikt ID; 422 nieprawidłowe dane; 502 OpenAI/odpowiedź modelu;
503 zajętość, konfiguracja, indeks lub baza.
Poza 422: {"detail":{"code":"busy","message":"Analiza trwa."}}.
422 zwraca standardową listę błędów FastAPI.
Kody: busy, configuration, openai_error, model_output, submission_conflict,
index_error, database_unavailable. Respektuj Retry-After, jeśli występuje.
Konfiguracja i nieaktualny indeks wymagają poprawienia przyczyny.
Usługa obsługuje jedną analizę naraz i nie ma uwierzytelniania.
CORS_ORIGINS określa dozwolone adresy frontendu (rozdzielone przecinkami).
Domyślnie: localhost i 127.0.0.1 na portach 5173 i 3000. Puste ustawienie
wyłącza CORS. Udostępniany nagłówek Retry-After pozwala frontendowi odczytać
czas oczekiwania; dozwolony jest POST JSON i jego preflight OPTIONS.

Oceny korzystają z progów i przykładów kalibracyjnych: ważność wynika z konkretnej szkody, a zasięg z opisanego wdrożenia. Brak zasięgu oznacza poziom 2; brak opisanej szkody poziom 2 ważności. Nie zakładamy automatycznie regionalnego wdrożenia. Przy pustym rozwiązaniu koszt i czas pozostają na poziomie 3. Wynik jest orientacyjnym rankingiem, a nie wyceną.

Powtórzenie tego samego `submission_id` zwraca zapisaną odpowiedź. Do sprawdzenia nowych ocen użyj nowego `submission_id`; restart serwera nie przelicza zapisanych wyników.

Score zapisujemy jako osobne kolumny PostgreSQL: `submissions.score` (średnia
zgłoszenia), `concepts.score` (ocena przy utworzeniu koncepcji) oraz
`submission_concepts.score` (ocena koncepcji w danym zgłoszeniu). Duplikat nie
nadpisuje pierwotnej oceny koncepcji. Wynik odpowiedzi nadal zawiera ocenę
bieżącego zgłoszenia. Kandydaci wyszukiwania zawierają również `concept.score`.
Kolumny dodawane są automatycznie przy połączeniu z bazą; konto bazy potrzebuje
uprawnień ALTER do tych tabel. Wcześniejsze rekordy i dane demo mają NULL;
nie są automatycznie przeliczane. Zachowane odpowiedzi pozostają bez zmian.

## GET /api/ideas — pomysły z tabel RAG

Czyta `rops_rag.concepts` i zlicza powiązania `submission_concepts`.
Nie wymaga tabel `public.Ideas`, autora, statusu ani klucza OpenAI.

Parametry query: `limit` (domyślnie 20, zakres 1–100), `offset` (domyślnie 0,
minimum 0), opcjonalnie `category` (dokładne ID kategorii, 1–100 znaków).
Sortowanie: najnowsze created_at, potem malejące id.

Przykład: `/api/ideas?limit=20&offset=0&category=1`.

```json
{
  "items": [{
    "id": 42,
    "problem": "Samotność",
    "audience": "Seniorzy",
    "solution": "Rozmowy z wolontariuszem",
    "category": "1",
    "context": "",
    "created_at": "2026-10-04T12:00:00+00:00",
    "score": 70.0,
    "liczba_zgloszen": 2
  }],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

`total` to liczba wszystkich pomysłów pasujących do filtra, nie długość strony.
Pusta lista daje 200 z items=[]. Score pochodzi z concepts.score i może być
null w starszych rekordach. ID jest naszym liczbowym concept_id, nie UUID Idea.
Endpoint nie zwraca surowych zgłoszeń ani zapisanych odpowiedzi analiz.

## GET /api/ideas/{concept_id} — szczegóły

Zwraca pojedynczy obiekt w takim samym formacie jak element items.
Brak pomysłu: 404, detail={code:"not_found",message:"Nie znaleziono pomysłu."}.
Nieprawidłowe parametry: 422. Brak konfiguracji lub niedostępna baza: 503.
Endpointy GET nie zmieniają danych pomysłów ani liczników. Połączenie nadal
inicjalizuje/migruje pomocniczy schemat zgodnie z klasą Database.
