# Zapis do encji eInicjatywa

POST jest podłączony do ApplicationStore i zapisuje do bazy aplikacji przez tę
samą transakcję co Pipeline. Tabele EF Core muszą istnieć po migracjach.
APP_DB_SCHEMA domyślnie public; nazwy tabel i kolumn PascalCase.

| Dane | Encja / kolumna |
|---|---|
| Nowe UUID v4 (zgodne z Guid) | Ideas.Id |
| problem | Ideas.Title |
| problem, audience, solution, context w sekcjach | Ideas.Description |
| Brak obrazu | Ideas.ImageUrl = NULL |
| UUID kategorii z POST | IdeaCategories.CategoryId |
| UUID utworzonego pomysłu | IdeaCategories.IdeaId |
| score koncepcji | Ideas.Score |
| author_id z żądania | Ideas.AuthorId |
| district_id z żądania | Ideas.DistrictId |
| APP_INITIAL_STATUS_ID | Ideas.StatusId |
| Czas UTC utworzenia | Ideas.CreatedAt, Ideas.LastUpdatedAt |
| UUID oryginału przy duplicate | Ideas.DuplicateOfId |

Każda koncepcja tworzy oddzielny Idea, także duplikat. Nowy pomysł ma
DuplicateOfId=NULL. Oryginał pozostaje bez zmian. LastUpdatedAt zmienia się
przy późniejszych edycjach po stronie aplikacji. Licznik to oryginał plus
liczba bezpośrednich duplikatów.

## Pomocniczy schemat rops_rag

- submissions, concepts, submission_concepts: tekst, struktura i oceny RAG.
- concept_embeddings: embeddingi powiązane z wewnętrznym BIGINT concept_id.
- processing_results: odpowiedzi API do bezpiecznego ponawiania.
- concept_idea_map: concept_id PK → idea_id UUID UNIQUE (oryginał aplikacji).
- submission_idea_map: submission_id, concept_id, idea_id UUID UNIQUE;
  PK (submission_id, idea_id). Łączy zgłoszenie z utworzonym rekordem Idea.

Mapowania przechowują UUID aplikacji. Nie zmieniamy liczbowych kluczy istniejących
tabel RAG. Usunięte oryginały są wykluczone z wyszukiwania przez JOIN do Ideas.
Pomocnicze UUID nie mają FK do tabel aplikacji; operacje usuwania EF nie są
blokowane. Zachowane odpowiedzi replay nie są aktualizowane po usunięciu Idea.

Synchronizacja czyta oryginalne Ideas (DuplicateOfId IS NULL), pobiera pierwszą
kategorię według UUID i zapisuje Title jako problem, Description jako solution.
Nieokreśleni odbiorcy i pusty kontekst są świadomym uproszczeniem indeksu MVP.
Brak kategorii oznacza wewnętrzne uncategorized i nie tworzy Category.
Nie importujemy duplikatów jako osobnych kandydatów.

## Score i migracje EF

Python wykonuje ALTER TABLE Ideas ADD COLUMN IF NOT EXISTS Score DOUBLE PRECISION
z kontrolą 0–100. Do Idea w C# dodaj `public double? Score { get; set; }`.
Jeżeli EF generuje migrację dodającą tę samą kolumnę, dostosuj ją do kolumny
już istniejącej. Model przekazany w rozmowie nie ma innych limitów długości;
Title nie jest ucinany. Role, hasła, komentarze i głosy nie są zmieniane.
