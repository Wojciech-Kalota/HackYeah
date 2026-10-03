# ROPS RAG

Usługa Python do analizy pomysłów społecznych, wywoływana przez backend .NET.
OpenAI wydziela koncepcje i przypisuje kategorie. Wyszukiwanie embeddingów
znajduje podobne rekordy, a drugie wywołanie LLM rozstrzyga dopasowanie.
Wyniki, koncepcje i liczniki zgłoszeń są przechowywane w PostgreSQL.

## Wymagania

- Standardowy Python dla Windows; polecenia poniżej używają Python 3.12.
- PostgreSQL z utworzoną bazą i kontem mogącym tworzyć schematy.
- Klucz OpenAI API i dostęp do skonfigurowanych modeli.
- Docker Desktop, jeśli wybierzesz bazę z dołączonego Compose.

Python MSYS2/MinGW nie jest zalecany: zależności natywne mogą wymagać
kompilacji zamiast instalacji gotowych pakietów.

## Instalacja

Uruchom z katalogu zawierającego `pyproject.toml`:

```powershell
py -3.12 -m venv .venv-win
.\.venv-win\Scripts\python.exe -m pip install -e ".[api,test]"
```

Polecenia korzystają bezpośrednio z interpretera środowiska; aktywacja nie
jest wymagana. Utwórz lokalny `.env` na podstawie `.env.example`.
Jeśli `.env` już istnieje, uzupełnij go bez nadpisywania klucza i hasła.

```dotenv
OPENAI_API_KEY=twoj-klucz
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
DATABASE_URL=postgresql://rops:twoje-haslo@localhost:5432/rops
POSTGRES_PASSWORD=twoje-haslo
```

`OPENAI_COMPARISON_MODEL` jest opcjonalny: domyślnie porównanie używa
`OPENAI_MODEL`. Wpisz model dostępny na Twoim koncie, obsługujący Structured
Outputs. Klucz i hasło przechowuj tylko w backendzie.
Znaki specjalne w haśle w `DATABASE_URL` muszą być zakodowane jako URL.
Zmienne środowiskowe mają pierwszeństwo przed `.env`.

## PostgreSQL

Dołączony Compose uruchamia PostgreSQL 17 na `127.0.0.1:5432`, z bazą `rops`,
użytkownikiem `rops` i hasłem `POSTGRES_PASSWORD` z `.env`:

```powershell
docker compose up -d postgres
docker compose ps
```

Dane są przechowywane w trwałym woluminie. Możesz też użyć własnej bazy:
ustaw jej adres w `DATABASE_URL`, bez uruchamiania Compose.
Usługa tworzy tabele we własnym schemacie `rops_rag`. Baza wskazana w URL
musi istnieć, a konto potrzebuje uprawnień CREATE w tej bazie.

## Uruchomienie API

```powershell
.\.venv-win\Scripts\python.exe -m uvicorn rops_rag.api:load_app --factory --host 127.0.0.1 --port 8000 --workers 1
```

- [Swagger](http://127.0.0.1:8000/docs) — interaktywne wywołania.
- [Kontrakt API](docs/API.md) — pola, statusy, błędy i ponawianie.
- [Klient .NET 8](examples/RagClient.cs) — przykład integracji.

API obsługuje jedną analizę naraz. Wywołuje je backend .NET na localhost.
Usługa nie ma uwierzytelniania ani CORS; dostęp między hostami wymaga
prywatnego połączenia i kontroli dostępu.

## Dane demonstracyjne i polecenia

Przykładowy tekst: `examples/pomysl.txt`; przykładowe kategorie: `examples/categories.json`. Każde wywołanie LLM lub embeddingów
korzysta z płatnego API OpenAI.

Opcjonalnie dodaj cztery fikcyjne koncepcje i utwórz ich embeddingi:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.seed_demo
.\.venv-win\Scripts\python.exe -m rops_rag.search index
```

Seed zapisuje dane w bazie z `DATABASE_URL`. Są to przykłady demonstracyjne,
nie zweryfikowane innowacje ROPS. Ponowienie seeda nie dodaje ich drugi raz.
Indeksowanie wywołuje API tylko dla brakujących lub zmienionych opisów.

Analiza tekstu bez zapisu i bez dostępu do bazy:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.analyze examples/pomysl.txt --categories examples/categories.json
```

Analiza i wyszukiwanie kandydatów bez zapisu zgłoszenia:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.search search examples/pomysl.txt --categories examples/categories.json --top-k 5
```

Pełny proces z porównaniem i zapisem:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.search process examples/pomysl.txt --categories examples/categories.json --submission-id test-001
```

Pusta baza jest obsługiwana: pierwsza koncepcja zostaje dodana jako nowa
w tej bazie. Nowe koncepcje otrzymują embedding od razu.

## Zasady działania

- Koncepcja zawiera `problem`, `audience`, `solution`, `category`, `context`.
  `solution` opisuje rozwiązanie razem ze sposobem działania.
- LLM wybiera jedną główną kategorię z listy przesłanej przez backend .NET
  w polu `categories`. Każda kategoria ma tekstowe `id` i `label`.
- Ekstrakcja zawiera cytat źródłowy i pytania, jeśli opis wymaga doprecyzowania.
  Walidacja cytatu toleruje różnice w odstępach i nowych liniach.
- Kategorie nie ograniczają wyszukiwania. Podobieństwo cosinusowe służy
  rankingowi kandydatów, nie jest prawdopodobieństwem duplikatu.
- Nowość oznacza brak odpowiednika w znalezionych kandydatach.
- Licznik oznacza liczbę niezależnych zgłoszeń przypisanych do koncepcji.
  Nowa koncepcja zaczyna od 1; powtórzenie powiązania nie zwiększa licznika.
- Identyczne ID, tekst i lista kategorii zwracają zachowany wynik bez kolejnych wywołań API.
  Po zmianie opisu lub kategorii użyj nowego ID.
- Cały zapis zgłoszenia jest transakcyjny. Błąd wycofuje zapis, ale nie
  koszty już wykonanych wywołań API.
- PostgreSQL advisory lock serializuje przetwarzanie także między procesami.
  Konkurencyjne żądanie może otrzymać odpowiedź o zajętości.
- Zmiana modelu embeddingów lub opisu koncepcji wymaga ponownego `index`.
  Wyszukiwanie odrzuca nieaktualny indeks.

Embeddingi przechowujemy w PostgreSQL, a ranking obliczamy w Pythonie.
Architektura jest przeznaczona do niewielkiej bazy i małego ruchu.
Poprawny format odpowiedzi nie gwarantuje trafności interpretacji modelu.

## Testy

```powershell
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

Testy PostgreSQL wymagają `TEST_DATABASE_URL`. Szczegóły i zakres:
[tests/README.md](tests/README.md).
