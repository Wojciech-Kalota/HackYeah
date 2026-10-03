# ROPS RAG — MVP, etap 1

Backend do analizy pomysłów społecznych. Frontend jest poza zakresem.
Ten etap obejmuje format koncepcji i bazę SQLite. Nie ma jeszcze LLM,
embeddingów ani automatycznego dopasowania. Demo wskazuje dopasowanie ręcznie.

## Uruchomienie

Python 3.11 lub nowszy. Z katalogu projektu, bez instalowania zależności:

```powershell
python -m rops_rag.demo
python -m unittest discover -s tests -v
```

Demo działa w pamięci. Wynik: jedna koncepcja i `liczba_zgloszen = 2`,
mimo ponownego zapisania tego samego powiązania.
Trwała baza: `Database("data/rops.sqlite3")`.

## Ustalenia

- Koncepcja: problem, odbiorcy, rozwiązanie, mechanizm, kontekst.
- Jedno zgłoszenie może zawierać kilka koncepcji.
- Identyfikator zgłoszenia musi pozostawać ten sam podczas ponawiania żądania.
- Licznik wynika z liczby niezależnych powiązanych zgłoszeń. Nowa koncepcja zaczyna od 1.
- Powtórzenie powiązania nie zwiększa licznika. Ten sam tekst z nowym ID jest niezależnym zgłoszeniem.
- Oryginalny tekst i uzasadnienia są zachowane. Nie logujemy treści zgłoszeń poza demonstracją.
- Metody bazy są transakcyjne; atomowość całego przyszłego procesu wymaga osobnej implementacji.
- Ponowne dodanie nowej koncepcji tworzy nowy rekord: obecna baza sama nie wykrywa duplikatów.
- Panel administratora i uwierzytelnianie nie są częścią tego etapu.

## Plan na około 20 godzin

1. Fundament i kontrakt danych — 2 h.
2. LLM: wydzielanie koncepcji do walidowanego JSON — 3 h.
3. Embeddingi i wyszukiwanie kilku kandydatów — 3 h.
4. Porównanie kandydatów: to samo / podobne / nowe / do weryfikacji — 4 h.
5. Zapis decyzji, obsługa ponowień całego procesu, endpoint dla frontendu — 3 h.
6. Ocena na ręcznie opisanych przykładach, błędy i instrukcja integracji — 5 h.

Następny etap wymaga wyboru dostępnego dostawcy LLM i embeddingów.
Klucze API pozostają poza repozytorium. Nie potrzebujemy teraz LangChain,
osobnej bazy wektorowej ani rozbudowanej infrastruktury.
