# Kontrakt API — ROPS RAG

Adres lokalny: `http://127.0.0.1:8000`. Format: JSON, UTF-8.
Swagger: `/docs`. Specyfikacja OpenAPI: `/openapi.json`.
API wywołuje backend .NET; klucze OpenAI i dane PostgreSQL pozostają w Pythonie.

## POST /api/ideas/analyze

Analizuje pomysł, porównuje koncepcje z bazą i zapisuje wynik.

```json
{
  "submission_id": "6f1c2b75-ff09-4e67-a57e-0123456789ab",
  "text": "Wolontariusze będą co tydzień dzwonić do samotnych seniorów.",
  "categories": [{"id":"integracja_spoleczna","label":"Integracja społeczna"}]
}
```

| Pole | Typ | Wymagania |
| --- | --- | --- |
| submission_id | string | 1–200 znaków, nie same spacje; ID generuje .NET |
| text | string | 1–30 000 znaków, nie same spacje |
| categories | array | Lista kategorii pobrana przez .NET ze swojego backendu |

Wszystkie trzy pola są wymagane. `categories` zawiera 1–100 elementów `{id,label}`; ID są unikalnymi tekstami 1–100 znaków, etykiety tekstami 1–200 znaków. Skrajne spacje są odrzucane. Dodatkowe pola są odrzucane.

### Odpowiedź 200

```json
{
  "submission_id": "6f1c2b75-ff09-4e67-a57e-0123456789ab",
  "replayed": false,
  "categories": [{"id":"integracja_spoleczna","label":"Integracja społeczna"}],
  "extraction": {
    "status": "ok",
    "concepts": [{
      "problem": "Samotność",
      "audience": "Seniorzy",
      "solution": "Wolontariusze dzwonią do seniorów raz w tygodniu.",
      "category": "integracja_spoleczna",
      "context": "",
      "source_quote": "Wolontariusze będą co tydzień dzwonić do samotnych seniorów."
    }],
    "questions": []
  },
  "decisions": [{
    "input_concept": {
      "problem": "Samotność",
      "audience": "Seniorzy",
      "solution": "Wolontariusze dzwonią do seniorów raz w tygodniu.",
      "category": "integracja_spoleczna",
      "context": "",
      "source_quote": "Wolontariusze będą co tydzień dzwonić do samotnych seniorów."
    },
    "decision": {
      "kind": "new",
      "candidate_id": null,
      "reason": "Brak odpowiednika w bazie.",
      "questions": []
    },
    "concept_id": 42,
    "candidates": [],
    "liczba_zgloszen": 1
  }]
}
```

`extraction.status`:

| Wartość | Znaczenie |
| --- | --- |
| ok | Koncepcje przekazane do porównania |
| needs_clarification | Wyświetl extraction.questions; decisions jest puste |
| no_concepts | Nie wykryto koncepcji; decisions jest puste |

`decision.kind`:

| Wartość | Zapis | candidate_id |
| --- | --- | --- |
| duplicate | Powiązanie z istniejącą koncepcją | ID dopasowanego rekordu |
| similar | Nowa koncepcja z relacją do podobnej | ID podobnego rekordu |
| new | Nowa koncepcja | null |
| needs_clarification | Pytania bez zapisu koncepcji | null |

`concept_id` to ID koncepcji przypisanej zgłoszeniu. `liczba_zgloszen` to jej
licznik po przetworzeniu. Oba są `null` dla decyzji `needs_clarification`.
Przy tej decyzji wyświetl `decision.questions`. Odpowiedź 200 nie zawsze oznacza
zapis koncepcji. Jeden tekst może zawierać wiele koncepcji.
ID koncepcji mapuj na C# `long`; licznik również może być `long`.

`candidates` zawiera do pięciu elementów:

```json
{
  "concept": {
    "id": 12,
    "problem": "Samotność",
    "audience": "Seniorzy",
    "solution": "Cotygodniowe rozmowy telefoniczne z wolontariuszem.",
    "category": "integracja_spoleczna",
    "context": "Małopolska",
    "created_at": "2026-10-03T12:00:00+00:00",
    "liczba_zgloszen": 3
  },
  "similarity": 0.87
}
```

`similarity` jest liczbą -1..1, nie procentem pewności. `created_at` to ISO 8601
ze strefą czasu; w .NET użyj `DateTimeOffset`. `solution` opisuje rozwiązanie
i sposób działania. `context` może być pustym tekstem.

### Ponawianie

Ten sam ID, tekst i lista kategorii zwracają zapisany wynik z `replayed: true`,
bez API i zmian licznika. Wynik jest historyczny, a liczniki nie są odświeżane.
Zmieniony tekst lub lista kategorii wymaga nowego ID.
Po timeout analiza może nadal trwać: ponów z tym samym ID i tekstem.
Przykład HttpClient ustawia timeout 15 minut; czas wykonania nie jest gwarantowany.

## Kategorie

.NET przesyła słownik w `categories` każdego POST. Python nie pobiera kategorii
samodzielnie i nie udostępnia katalogu kategorii. LLM zwraca jedno ID z listy.
ID są tekstowe; numeryczne ID backendu .NET zamień na string przy wysyłaniu.
Gdy żadna kategoria nie pasuje, wynik wymaga doprecyzowania zamiast wymyślania ID.
Odpowiedź zawiera także przesłaną listę `categories`, uporządkowaną według ID.
Zmiana ID lub etykiety kategorii przy tym samym submission_id to konflikt 409.
Zmiana kolejności kategorii nie jest zmianą zgłoszenia.
Kandydaci z bazy mogą mieć kategorię spoza bieżącej listy: to zapis historyczny.
Duplikat zachowuje kategorię istniejącego rekordu; input_concept zawiera bieżącą
klasyfikację zgłoszenia. Kategorie nie ograniczają wyszukiwania.

## GET /health

```json
{"status": "ok"}
```

Sprawdza proces, nie gotowość PostgreSQL, indeksu ani OpenAI.

## Błędy

| HTTP | Znaczenie |
| --- | --- |
| 409 | Konflikt ID zgłoszenia |
| 422 | Nieprawidłowe pola lub format żądania |
| 502 | Błąd OpenAI albo niespójna odpowiedź modelu |
| 503 | Zajętość, konfiguracja, indeks lub baza niedostępna |

Poza 422 format błędu:

```json
{"detail":{"code":"busy","message":"Analiza trwa. Ponów z tym samym ID."}}
```

Kody: `busy`, `configuration`, `openai_error`, `model_output`,
`submission_conflict`, `index_error`, `database_unavailable`.
422 zawiera standardową listę błędów FastAPI w `detail`.
Przy ponawianiu respektuj `Retry-After`, jeśli występuje.
Błędy konfiguracji/indeksu i konflikt ID wymagają poprawienia przyczyny.

## Integracja .NET

Przykład: [RagClient.cs](../examples/RagClient.cs), .NET 8 i HttpClient.
Wywołanie odbywa się z backendu, a nie bezpośrednio z przeglądarki.
Usługa lokalna nie wymaga uwierzytelniania i nie ma CORS.
Przy oddzielnych hostach skonfiguruj prywatne połączenie i kontrolę dostępu.
MVP przyjmuje jedną analizę naraz; konkurencyjne żądania otrzymują zajętość.
