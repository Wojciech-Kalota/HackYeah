# ROPS RAG

Python przyjmuje zgłoszenia z frontendu, analizuje pomysły przez OpenAI,
wyszukuje podobne i zapisuje je bezpośrednio do tabel aplikacji EF Core
`Ideas` oraz `IdeaCategories` w tej samej bazie PostgreSQL.

## Instalacja

Wymagane: standardowy Python 3.12, baza aplikacji po migracjach EF, klucz OpenAI.

```powershell
py -3.12 -m venv .venv-win
.\.venv-win\Scripts\python.exe -m pip install -e ".[api,test]"
```

Utwórz `.env` na podstawie `.env.example`, bez nadpisywania istniejącego.
Ustaw:

- `DATABASE_URL`: adres **bazy aplikacji**, w formacie PostgreSQL URI, nie ConnectionString C#.
- `APP_DB_SCHEMA`: schemat tabel aplikacji, domyślnie `public`.
- `APP_INITIAL_STATUS_ID`: UUID istniejącego rekordu `Statuses`.
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL`.
- `CORS_ORIGINS`: adres frontendu, np. `http://localhost:5173`; kilka rozdziel przecinkami.

Domyślne nazwy tabel/kolumn odpowiadają przekazanemu AppDbContext: PascalCase,
np. `public."Ideas"`, `"AuthorId"`. Konfiguracja snake_case nie jest obsługiwana.
Klucz OpenAI i dane połączenia pozostają wyłącznie na serwerze.

Python dodaje nullable `Ideas.Score` z zakresem 0–100 oraz tworzy pomocniczy
schemat `rops_rag`. Konto potrzebuje CREATE na bazie, SELECT/INSERT w tabelach
aplikacji i ALTER na Ideas. Nie tworzymy użytkowników, kategorii, statusów ani
obszarów. W encji C# Idea dodaj `public double? Score { get; set; }`;
kolejna migracja EF musi uwzględnić kolumnę już dodaną przez Python.

## Uruchomienie

```powershell
.\.venv-win\Scripts\python.exe -m uvicorn rops_rag.api:load_app --factory --host 127.0.0.1 --port 8000 --workers 1
```

[Swagger](http://127.0.0.1:8000/docs) · [Kontrakt API](docs/API.md) ·
[Klient fetch](examples/ragClient.js) · [Mapowanie encji](docs/ENTITY_MAPPING.md)

Frontend generuje UUID raz dla zgłoszenia i używa go przy ponowieniach.
Przesyła tekst, kategorie z rzeczywistymi UUID, `author_id` oraz `district_id`.
Kategorie muszą odpowiadać rekordom Categories, łącznie z etykietą Name.
Początkowy status pochodzi z konfiguracji serwera.

## Zapis i wyszukiwanie

Każda wydzielona koncepcja tworzy Idea z UUID. Duplikat tworzy osobne Idea,
a DuplicateOfId wskazuje istniejący oryginał. IdeaCategory zapisuje wybraną
kategorię. Score to ocena bieżącej koncepcji, bez ujawniania ocen składowych.
CreatedAt i LastUpdatedAt są ustawiane na ten sam czas UTC przy utworzeniu.
Duplikat nie zmienia danych ani dat oryginału.

Istniejące oryginalne Ideas są synchronizowane do pomocniczego indeksu RAG.
Description służy jako treść rozwiązania, Title jako problem. Nie wykonujemy
ponownej ekstrakcji istniejących opisów. Synchronizacja i uzupełnianie embeddingów
odbywają się przed analizą; pierwsza analiza dużej bazy może trwać dłużej i
wywołuje płatne API embeddingów. Możesz wcześniej przygotować indeks:

```powershell
.\.venv-win\Scripts\python.exe -m rops_rag.search index
```

Zapis Idea, kategorii, powiązań i wyniku RAG jest wspólną transakcją; błąd
wycofuje zapis. Koszty wykonanych wywołań OpenAI nie są wycofywane.
Ten sam identyfikator, tekst, kategorie i kontekst autora/obszaru zwracają
zapisaną odpowiedź bez tworzenia kolejnych Idea. Liczniki w replay są historyczne.

## Score

Ważność 40%, zasięg 30%, koszt 20%, czas do pilotażu 10%. Koszt i czas są
odwrócone; wynik wynosi 0–100. Brak rozwiązania daje neutralny koszt/czas.
Progi i przykłady są w scoring.py. Wynik to orientacyjny ranking, nie wycena.
Score przechowują Ideas oraz pomocnicze tabele zgłoszeń i koncepcji.

## Testy

```powershell
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

Testy PostgreSQL wymagają TEST_DATABASE_URL na osobnej bazie testowej.
[Testy](tests/README.md) tworzą i usuwają własne schematy. Testy modeli są atrapami.

## Dostęp

MVP nie uwierzytelnia użytkowników. Sprawdzenie author_id potwierdza istnienie
użytkownika, nie jego tożsamość. Przed publicznym udostępnieniem połącz endpoint
z uwierzytelnianiem aplikacji; autor powinien pochodzić z potwierdzonej sesji.
CORS nie zastępuje tego sprawdzenia. Do lokalnego MVP uruchamiaj API na localhost.
