# ROPS RAG

Usługa Python analizuje pomysły społeczne i zapisuje wyniki w PostgreSQL.
Frontend przesyła tekst, identyfikator zgłoszenia i listę kategorii.
Proces: ekstrakcja LLM → wyszukiwanie embeddingów → porównanie LLM → zapis.

## Instalacja

Standardowy Python 3.12 dla Windows, PostgreSQL i klucz OpenAI API.
Z katalogu projektu:

```powershell
py -3.12 -m venv .venv-win
.\.venv-win\Scripts\python.exe -m pip install -e ".[api,test]"
```

Utwórz lokalny .env na podstawie .env.example, bez nadpisywania istniejącego.
Ustaw OPENAI_API_KEY, OPENAI_MODEL, OPENAI_EMBEDDING_MODEL i DATABASE_URL.
Opcjonalny OPENAI_COMPARISON_MODEL domyślnie używa OPENAI_MODEL.
Zmienne środowiskowe mają pierwszeństwo przed .env.
Znaki specjalne w haśle DATABASE_URL zakoduj jako URL.

## PostgreSQL

Baza wskazana w DATABASE_URL musi istnieć. Python tworzy własny schemat
rops_rag oraz tabele, więc konto potrzebuje CREATE i uprawnień zapisu.
Opcjonalna lokalna baza: ustaw POSTGRES_PASSWORD w .env, potem:

```powershell
docker compose up -d postgres
```

Compose udostępnia PostgreSQL 17 na localhost:5433 i trwały wolumin.
Hasło musi odpowiadać DATABASE_URL. Model koncepcji zawiera problem, audience,
solution, category i context. solution opisuje rozwiązanie i sposób działania.
Nie uzupełniamy brakującego rozwiązania domysłami. Kategorie otrzymujemy w każdym POST jako listę {id,label}; model wybiera jedno ID.

## Uruchomienie API

Najprościej uruchomić PostgreSQL i API razem w Dockerze:

```powershell
docker compose up -d --build
```

API jest wtedy dostępne na `http://127.0.0.1:8000`. Po zmianie `.env`
uruchom ponownie `docker compose up -d api`, aby kontener wczytał nowe zmienne.

Alternatywnie API można uruchomić lokalnie:

```powershell
.\.venv-win\Scripts\python.exe -m uvicorn rops_rag.api:load_app --factory --host 127.0.0.1 --port 8000 --workers 1
```

[Swagger](http://127.0.0.1:8000/docs), [kontrakt API](docs/API.md),
[klient JavaScript](examples/ragClient.js).
Frontend wywołuje API; Python zapisuje koncepcje i zwiększa liczniki w PostgreSQL.
Klucz OpenAI i DATABASE_URL pozostają wyłącznie w usłudze Python.

W `.env` ustaw `CORS_ORIGINS` na adres frontendu, np. `http://localhost:5173`.
Kilka adresów rozdziel przecinkami, bez ścieżek i końcowego ukośnika.
Domyślnie dozwolone są localhost i 127.0.0.1 na portach 5173 oraz 3000.
Pusta wartość wyłącza CORS. Po zmianie zrestartuj API. CORS nie zastępuje
uwierzytelniania; MVP nie ma uwierzytelniania.

Frontend generuje `submission_id` przez `crypto.randomUUID()` raz dla nowego
zgłoszenia i zachowuje całe żądanie na czas ponowień. Kategorie pobiera ze
źródła kategorii projektu i przesyła jako listę `{id,label}`. RAG nie udostępnia
endpointu do pobierania kategorii. Przykład klienta używa `fetch` i zapisuje
żądanie w pamięci; jeśli ma przetrwać odświeżenie strony, aplikacja musi je
zachować np. w `sessionStorage`.

## Polecenia lokalne

Opcjonalne fikcyjne dane demonstracyjne w bazie DATABASE_URL i ich indeks:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.seed_demo
.\.venv-win\Scripts\python.exe -m rops_rag.search index
```

Seed zawiera dwa przykłady, nie zweryfikowane innowacje ROPS.
Indeksowanie wywołuje płatne API tylko dla brakujących/zmienionych koncepcji.
Analiza tekstu bez zapisu:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.analyze examples/pomysl.txt --categories examples/categories.json
```

Wyszukiwanie bez zapisu zgłoszenia:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.search search examples/pomysl.txt --categories examples/categories.json --top-k 5
```

Pełny proces z zapisem:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.search process examples/pomysl.txt --categories examples/categories.json --submission-id test-001
```

Pusta baza jest obsługiwana. Nowe koncepcje są indeksowane od razu.
Nieaktualny indeks wymaga search index. Kategorie nie ograniczają wyszukiwania.
Similarity to ranking -1..1, nie procent pewności; nowość jest oceniana
względem odnalezionych kandydatów.

## Zapis i ponawianie

duplicate wiąże zgłoszenie z identyczną lub podobną koncepcją; new tworzy nową.
Jeśli rozwiązanie jest niejasne albo go nie podano, solution jest pustym
tekstem. Opis samej potrzeby również podlega klasyfikacji i zapisowi. Licznik jest liczbą niezależnych powiązanych zgłoszeń.
Nowa koncepcja zaczyna od 1. Powtórzenie powiązania nie zwiększa licznika.

Ten sam submission_id, tekst i kategorie zwracają zapisany wynik z replayed=true,
bez kolejnych wywołań API. Zmiana tekstu, ID lub etykiet kategorii wymaga nowego
ID zgłoszenia. Kolejność kategorii nie wpływa na ponowienie.
Liczniki w zachowanym wyniku są historyczne, z momentu przetworzenia.
Cały zapis jest transakcyjny; błąd wycofuje dane, nie koszty wykonanych wywołań.
Advisory lock PostgreSQL serializuje analizy także między procesami.

## Ocena pomysłu

LLM ocenia koszt, czas do pilotażu, znaczenie społeczne i zasięg korzyści
w skali 1–5. Python oblicza score 0–100, premiując wpływ oraz niższy koszt
i krótszy czas. API zwraca wyłącznie score, bez ocen składowych.
Wynik zgłoszenia jest średnią wyników koncepcji; brak koncepcji oznacza null.
Score jest szacunkiem priorytetu, nie kwotą ani obietnicą terminu.
Wagi i wzór: [kontrakt API](docs/API.md).

## Uruchomienie testów

```powershell
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

Testy bazy wymagają TEST_DATABASE_URL. [Instrukcja](tests/README.md).
Testy używają atrap OpenAI; trafność modeli oceniaj również ręcznie.

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

## Odczyt pomysłów dla frontendu

- `GET /api/ideas?limit=20&offset=0` — lista ze score i liczbą zgłoszeń.
- `GET /api/ideas?category=1` — filtr po ID kategorii.
- `GET /api/ideas/42` — szczegóły pomysłu; 404, jeśli nie istnieje.

Odczyt i aktualny POST używają tabel `rops_rag`, bez zależności od tabel EF Core.
GET potrzebuje tylko DATABASE_URL; nie wywołuje OpenAI. Kontrakt i przykłady
odpowiedzi znajdują się w docs/API.md. Po skopiowaniu zmian zrestartuj API.
