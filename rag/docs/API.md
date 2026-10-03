# Kontrakt API — ROPS RAG

Adres: http://127.0.0.1:8000. JSON UTF-8. Swagger: /docs.
Python wykonuje analizę i zapis w PostgreSQL. .NET wywołuje API.

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
Kategorie pobiera .NET ze swojego backendu i przesyła w POST.

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
ID koncepcji i liczniki mapuj na C# long; ID kategorii są string.
contract_version=3 oznacza ten format odpowiedzi.

### Score

`score` jest liczbą 0–100, z jednym miejscem po przecinku. Występuje dla
każdej koncepcji i decyzji oraz na poziomie całego zgłoszenia (średnia ocen
koncepcji). Przy no_concepts score zgłoszenia jest null. .NET może użyć
typu nullable double/decimal. Oceny składowe nie są zwracane.

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
Nieznane parametry przyjmują 3; przy pustym solution koszt i czas wynoszą 3.
Ocena dotyczy bieżącego zgłoszenia, także gdy zostanie dopasowane jako duplikat.

candidates zawiera do pięciu {concept,similarity}. concept zawiera id,
problem, audience, solution, category, context, created_at i liczba_zgloszen.
created_at to ISO 8601 ze strefą (DateTimeOffset). similarity to double -1..1,
nie procent pewności. Kategorie kandydatów mogą być historyczne.
solution opisuje rozwiązanie wraz ze sposobem działania.

## Ponawianie i .NET

Ten sam submission_id, dokładnie ten sam tekst i kategorie zwracają zachowany
wynik z replayed=true, bez API i zmian licznika. Kolejność kategorii nie ma
znaczenia; zmiana ID/etykiety lub tekstu to konflikt 409.
.NET nie wykonuje dodatkowego zapisu koncepcji ani zwiększania liczników.
Po timeout analiza może nadal trwać: ponów z tym samym ID i danymi.
Liczniki w odpowiedzi replay są historyczne, nie są odświeżane.
Przykład HttpClient: [RagClient.cs](../examples/RagClient.cs), timeout 15 minut.

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
Usługa działa na localhost, bez uwierzytelniania i CORS, jedna analiza naraz.
