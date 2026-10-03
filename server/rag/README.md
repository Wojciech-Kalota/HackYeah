# ROPS RAG — PostgreSQL, kategorie i API .NET

Proces: tekst → LLM wydziela koncepcje i kategorie → embeddingi wyszukują
kandydatów → drugi LLM porównuje → Python zapisuje decyzje w PostgreSQL.

## Instalacja

Python 3.11+. Z katalogu projektu:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[api,test]"
Copy-Item .env.example .env
```

Jeśli masz już `.env`, uzupełnij go zamiast nadpisywać. Wpisz lokalnie klucz
OpenAI oraz `DATABASE_URL`. Nie udostępniaj pliku ani hasła w repozytorium.
Python MSYS2 może tworzyć `.venv/bin/python.exe` zamiast `Scripts/python.exe`.
Poniższe polecenia zakładają aktywne środowisko z zainstalowanymi zależnościami.

```dotenv
OPENAI_API_KEY=twoj-klucz
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
DATABASE_URL=postgresql://rops:twoje-haslo@localhost:5432/rops
```

PostgreSQL i baza wskazana w URL muszą już istnieć. Aplikacja tworzy własny
schemat `rops_rag` i tabele; konto potrzebuje uprawnień CREATE w bazie.
Nie korzystamy z tabel aplikacji .NET. Połączenia mają timeout 10 sekund.
Znaki specjalne w użytkowniku/haśle zakoduj zgodnie z formatem URL.
Klucz i URL pozostają wyłącznie w backendzie.

Opcjonalnie lokalna baza w Docker Desktop: ustaw w `.env` `POSTGRES_PASSWORD`
i identyczne hasło w `DATABASE_URL`, potem:

```powershell
docker compose up -d postgres
```

`compose.yaml` używa PostgreSQL 17, portu 5432 dostępnego tylko na localhost
i trwałego woluminu. Jeśli masz własny PostgreSQL, pomiń Docker.
Hasło z `.env.example` jest przykładem — ustaw własne.

## Nowy format koncepcji

```json
{
  "problem": "Samotność",
  "audience": "Seniorzy",
  "solution": "Wolontariusz dzwoni raz w tygodniu, aby porozmawiać i zapytać o potrzeby.",
  "category": "integracja_spoleczna",
  "context": "Wsie Małopolski",
  "source_quote": "Wolontariusz dzwoni raz w tygodniu"
}
```

`solution` łączy rozwiązanie i sposób działania. Pole `mechanism` usunięto.
`source_quote` to cytat z oryginalnego tekstu, zachowany w wyniku procesu.
Ekstrakcja: `status` (`ok`, `needs_clarification`, `no_concepts`), `concepts`, `questions`.
Niejasne opisy wymagają pytań, nie dopisywania faktów.
Walidacja cytatu toleruje tylko różnice w białych znakach.
Structured Outputs i cytaty nie gwarantują poprawności interpretacji LLM.

Jedna kategoria główna na koncepcję. Stałe identyfikatory i etykiety:

| ID | Etykieta |
| --- | --- |
| bezpieczenstwo | Bezpieczeństwo |
| cyberbezpieczenstwo | Cyberbezpieczeństwo |
| infrastruktura_drogowa | Infrastruktura drogowa |
| transport_i_mobilnosc | Transport i mobilność |
| zdrowie | Zdrowie |
| zdrowie_psychiczne | Zdrowie psychiczne |
| edukacja | Edukacja |
| wlaczenie_cyfrowe | Włączenie cyfrowe |
| integracja_spoleczna | Integracja społeczna |
| dostepnosc | Dostępność |
| opieka_i_wsparcie | Opieka i wsparcie |
| srodowisko | Środowisko |
| rynek_pracy | Rynek pracy |
| inne | Inne |

Słownik: `rops_rag/categories.py`. Kategorie są walidowane przez model danych
i constraint PostgreSQL. Dotyczą dominującego celu, nie grupy odbiorców.
Nie filtrujemy kandydatów po kategorii: błędna klasyfikacja nie może ukryć
duplikatu. Kategoria nie jest częścią tekstu embeddingu i nie przesądza decyzji.

## Uruchomienie krok po kroku

1. Ekstrakcja bez bazy i bez zapisu:

```powershell
python -m rops_rag.analyze examples/pomysl.txt
```

2. Opcjonalne fikcyjne dane demonstracyjne w bazie z `DATABASE_URL`:

```powershell
python -m rops_rag.seed_demo
```

To cztery przykłady, nie zweryfikowane innowacje ROPS. Nie uruchamiaj seeda
w bazie, w której nie chcesz danych demonstracyjnych. Powtórzenie nie dodaje
ponownie tych samych zgłoszeń.

3. Indeksowanie istniejących koncepcji i wyszukiwanie bez zapisu zgłoszenia:

```powershell
python -m rops_rag.search index
python -m rops_rag.search search examples/pomysl.txt
```

`index` wysyła tylko brakujące/zmienione koncepcje do API embeddingów.
Wektory, model i skrót tekstu są w PostgreSQL; cosine similarity liczymy
w Pythonie. Przy małej bazie nie potrzebujemy pgvector.
Zmiana modelu embeddingów lub opisu wymaga ponownego `index`.
Nieaktualny indeks blokuje wyszukiwanie. Wynik obejmuje do pięciu kandydatów
na koncepcję (`--top-k 3` zmienia tę liczbę w poleceniu search).
`similarity` to liczba -1..1, nie prawdopodobieństwo duplikatu.

4. Pełny proces z drugim LLM i zapisem:

```powershell
python -m rops_rag.search process examples/pomysl.txt --submission-id test-001
```

`duplicate`: powiązanie z istniejącą koncepcją i jedno nowe zgłoszenie;
`similar`: osobny rekord z relacją do podobnego; `new`: osobny rekord;
`needs_clarification`: wynik z pytaniami bez zapisu koncepcji.
Pusta baza oznacza pierwszą nową koncepcję bez porównania z kandydatami.
Nowość jest oceniana wyłącznie względem znalezionych kandydatów.
Nowe rekordy otrzymują embedding od razu.

Identyczny ID i tekst zwracają zachowany wynik (`replayed: true`), bez API
i zmian liczników. Inny tekst z tym samym ID jest konfliktem.
Po doprecyzowaniu opisu użyj nowego ID. Liczniki w zachowanym wyniku są
historyczne, z momentu przetwarzania. Licznik to liczba niezależnych zgłoszeń,
nie ocena skuteczności innowacji; nowa koncepcja zaczyna od 1.
Cały zapis jest transakcyjny: błąd wycofuje zgłoszenie, koncepcje i powiązania.
Koszt wcześniej wykonanych wywołań API nie jest wycofywany.
PostgreSQL advisory lock serializuje analizy również między procesami;
konkurencyjny proces otrzyma błąd zajętości. Blokada trwa także podczas API.

## API dla .NET

```powershell
python -m uvicorn rops_rag.api:load_app --factory --host 127.0.0.1 --port 8000 --workers 1
```

Dokumentacja: http://127.0.0.1:8000/docs

- `GET /health`: sprawdza działanie procesu, nie bazę ani OpenAI.
- `GET /api/categories`: lista `{id,label}`, bez wywołań OpenAI.
- `POST /api/ideas/analyze`: pełny proces z zapisem.

```json
{"submission_id":"test-002","text":"Opis pomysłu"}
```

Odpowiedź: `submission_id`, `replayed`, `extraction`, `decisions`.
Każda decyzja: `input_concept`, `decision` (`kind`, `candidate_id`, `reason`,
`questions`), `concept_id`, `candidates`, `liczba_zgloszen`.
Koncepcje w wynikach zawierają `category` i nie zawierają `mechanism`.
Odpowiedź 200 może wymagać doprecyzowania zamiast dodania koncepcji.

Błędy: 422 nieprawidłowe dane, 409 konflikt ID, 502 błąd OpenAI/modelu,
503 zajętość, problem z bazą, indeks lub brak konfiguracji.
Poza 422 błędy mają `detail.code` i `detail.message`.
Usługa przyjmuje jedną analizę naraz; `busy` zwraca `Retry-After`.
Każde ponowienie zachowuje ten sam ID i dokładnie ten sam tekst.
Po timeout .NET analiza może nadal trwać — nie generuj nowego ID.

Przykład .NET 8: `examples/RagClient.cs`. Nie był tutaj kompilowany.
Przykład używa timeout 15 minut, bez gwarancji czasu wykonania.
Endpoint ma nowy format odpowiedzi: zaktualizuj DTO po stronie .NET.
Usługa domyślnie słucha localhost, bez uwierzytelniania i CORS.
Przy osobnych hostach skonfiguruj prywatne połączenie i kontrolę dostępu.

## Przejście z SQLite

SQLite nie jest już używane. Opcja CLI `--db` i `RAG_DB_PATH` są usunięte.
Stare pliki `.sqlite3` pozostają nietknięte; nie kopiujemy ich automatycznie
do PostgreSQL. Dla demonstracji uruchom seed w nowej bazie.
Migracja rzeczywistych wcześniejszych danych wymaga osobnego importu:
połączenia solution/mechanism, przypisania kategorii i odtworzenia embeddingów.
Nie należy kopiować starych embeddingów: format tekstu indeksowanego zmienił się.

## Testy

```powershell
python -m unittest discover -s tests -v
```

Bez `TEST_DATABASE_URL` testy integracyjne bazy są jawnie pomijane.
Do sprawdzenia PostgreSQL użyj osobnej bazy testowej:

```powershell
$env:TEST_DATABASE_URL = "postgresql://rops:twoje-haslo@localhost:5432/rops"
python -m unittest discover -s tests -v
```

Każdy test tworzy losowy schemat `rops_test_*` i usuwa wyłącznie ten schemat.
Testy nie wywołują płatnego API. Jednostkowe sprawdzają format, kategorie,
cytaty i endpointy. Integracyjne sprawdzają zapis, rollback, liczniki i replay.
W tym środowisku nie ma uruchomionego PostgreSQL; integracja bazy wymaga
weryfikacji na uruchomionym serwerze. Trafność modeli wymaga ręcznej oceny.

Dokumentacja: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs),
[embeddingi](https://developers.openai.com/api/docs/guides/embeddings),
[Psycopg](https://www.psycopg.org/psycopg3/docs/basic/usage.html).
