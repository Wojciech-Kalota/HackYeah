# Testy

Uruchamiaj z głównego katalogu projektu po instalacji dodatków `api,test`:

```powershell
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

## Testy jednostkowe

Sprawdzają ekstrakcję, cytaty źródłowe, walidację kategorii, schemat OpenAI
i endpointy HTTP z atrapą procesu. Nie wymagają klucza OpenAI ani PostgreSQL.
Testy nie wykonują płatnych wywołań API.

## Testy PostgreSQL

Ustaw adres bazy testowej w środowisku procesu:

```powershell
$env:TEST_DATABASE_URL = "postgresql://rops:twoje-haslo@localhost:5432/rops_test"
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

Baza musi istnieć, a konto musi móc tworzyć schematy. Każdy test tworzy
losowy schemat `rops_test_*` i usuwa wyłącznie swój schemat po zakończeniu.
Testy nie wczytują `TEST_DATABASE_URL` z `.env`.
Bez tej zmiennej testy integracyjne są jawnie pomijane.

Zakres: integralność powiązań, liczniki, indeksowanie i ranking na kontrolowanych
wektorach, zapis decyzji, rollback całego zgłoszenia, ponowienia po ID,
blokada równoległego przetwarzania i integracja HTTP z bazą.
LLM i embeddingi są zastępowane atrapami także w testach PostgreSQL.

## Ocena modeli

Testy automatyczne nie mierzą trafności rzeczywistych modeli. Przed prezentacją
sprawdź ręcznie: parafrazy tego samego pomysłu, różne rozwiązania tego samego
problemu, bliskie warianty, brakujące informacje i pomysły spoza bazy.
Oceń osobno wydzielenie koncepcji, kategorię, obecność właściwego kandydata
w pierwszej piątce oraz decyzję porównania.
