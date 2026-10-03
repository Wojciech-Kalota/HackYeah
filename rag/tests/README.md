# Testy

Z głównego katalogu projektu po instalacji dodatków api,test:

```powershell
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

Jednostkowe sprawdzają ekstrakcję, cytaty, dynamiczne kategorie, HTTP i ranking.
Testy nie wykonują płatnych wywołań API.
Testy integracyjne wymagają istniejącej bazy i TEST_DATABASE_URL w środowisku:

```powershell
$env:TEST_DATABASE_URL="postgresql://rops:haslo@localhost:5432/rops_test"
.\.venv-win\Scripts\python.exe -m unittest discover -s tests -v
```

Konto musi móc tworzyć schematy. Każdy test tworzy losowy schemat rops_test_*
i usuwa wyłącznie swój schemat po zakończeniu. Bez zmiennej testy są pomijane.
TEST_DATABASE_URL nie jest wczytywane z .env.
Integracyjne sprawdzają zapis, powiązania, liczniki, replay, konflikt kategorii,
puste solution i rollback całego zgłoszenia po błędzie.
Modele są zastąpione atrapami. Trafność modeli oceniaj dodatkowo ręcznie.
