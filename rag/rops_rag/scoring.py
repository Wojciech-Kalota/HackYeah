from pydantic import BaseModel, ConfigDict, Field


class Assessment(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    cost: int = Field(ge=1, le=5)
    duration: int = Field(ge=1, le=5)
    importance: int = Field(ge=1, le=5)
    reach: int = Field(ge=1, le=5)

    def score(self) -> float:
        # Skala 1..5 jest przekształcona do 0..100. Koszt/czas odwracamy.
        return round(25 * (
            0.4 * (self.importance - 1) + 0.3 * (self.reach - 1)
            + 0.2 * (5 - self.cost) + 0.1 * (5 - self.duration)
        ), 1)


SCORING_PROMPT = """
Oceń każdą koncepcję niezależnie w assessment: cost, duration, importance, reach.
Każde pole to liczba całkowita 1..5. To orientacyjny ranking, nie wycena.
Dobierz poziom do konkretnych cech opisu. Nie wybieraj 3 tylko dlatego,
że nie podano budżetu lub harmonogramu. Korzystaj z poziomów 1 i 5, gdy
spełnione są ich warunki; nie wymuszaj jednak rozkładu ocen ani skrajności.

cost — zasoby potrzebne do opisanego użytecznego pilotażu:
1: konfiguracja istniejącego narzędzia, zmiana procedury, praca obecnego personelu;
2: niewielki zakup lub prosta strona/formularz, bez trudnych integracji;
3: dedykowana aplikacja z integracją lub zespół prowadzący regularną usługę;
4: wielu specjalistów, trudne integracje, remont lub znaczący zakup sprzętu;
5: nowa infrastruktura, budowa obiektów, rozbudowana sieć lub wiele zespołów.
Nie utożsamiaj każdego rozwiązania cyfrowego z tanim formularzem. Oceniaj
pełny opisany pilot, nie wymyślaj łatwiejszego rozwiązania.

duration — czas do użytecznego pilotażu, nie okres późniejszego utrzymania:
1: do tygodnia (np. procedura lub gotowe narzędzie);
2: do miesiąca (np. prosty formularz lub mały zakup);
3: do kwartału (np. integracja lub organizacja regularnej usługi);
4: do roku (np. remont, złożony system, wymagane uzgodnienia);
5: ponad rok (np. budowa lub rozległa infrastruktura).
Wnioskowanie o złożoności jest dozwolone, dopisywanie terminów do opisu nie.
Przy pustym solution cost i duration wynoszą 3. Gdy rozwiązanie podano,
lecz jego złożoności nie da się ocenić, użyj 3 w nieznanym wymiarze.

importance — ciężar konkretnego problemu, nie atrakcyjność rozwiązania:
1: kosmetyka, dekoracja lub dodatkowa wygoda bez opisanej szkody;
2: drobna uciążliwość, oszczędność czasu, usprawnienie istniejącej obsługi;
3: istotna bariera w codziennym funkcjonowaniu lub dostępie do usług;
4: wykluczenie z podstawowych usług, poważna szkoda zdrowotna lub bezpieczeństwa;
5: bezpośrednie zagrożenie życia albo brak podstawowych warunków życia
   (np. wody, żywności, schronienia).
Słowa 'bezpieczeństwo', 'seniorzy', 'niepełnosprawność' lub 'AI' same w sobie
nie uzasadniają 4 ani 5. Gdy nie wskazano konkretnej szkody ani bariery,
użyj 2; ogólny pomysł społeczny nie otrzymuje automatycznie 4.

reach — zakres odbiorców opisanego wdrożenia, nie teoretyczna możliwość skalowania:
1: pojedyncze osoby lub jedno niewielkie miejsce/grupa;
2: jedna placówka, osiedle lub ograniczona grupa lokalna;
3: cała gmina/miasto lub wiele placówek w jednej społeczności;
4: wiele gmin/powiatów lub sieć instytucji;
5: wdrożenie ogólnoregionalne lub ogólnokrajowe, wyraźnie określone w opisie.
Przy nieokreślonym zasięgu użyj 2, nie zakładaj regionalnego wdrożenia
z samego kontekstu ROPS. Nie wymyślaj liczby odbiorców. Duży reach nie
podnosi automatycznie importance, a poważna szkoda nie podnosi reach.

Przykłady kalibracyjne; dopasuj do cech, nie kopiuj ocen po słowach kluczowych:
- Zmiana koloru przycisku na stronie jednej placówki dla estetyki:
  cost=1, duration=1, importance=1, reach=2; score=37.5.
- Dekoracyjna fontanna na jednym skwerze, wymagająca budowy przez ponad rok:
  cost=5, duration=5, importance=1, reach=1; score=0.
- Formularz zgłaszania niedostępnych PDF w jednej instytucji, pilot w miesiąc;
  dokumenty utrudniają załatwianie spraw:
  cost=2, duration=2, importance=3, reach=2; score=50.
- SMS o skażeniu wody z bezpośrednim zagrożeniem życia dla całego regionu,
  przez już działający system, konfiguracja w tydzień:
  cost=1, duration=1, importance=5, reach=5; score=100.
- Nowy szpital dla wielu powiatów, wieloletnia budowa, ograniczony dostęp do leczenia:
  cost=5, duration=5, importance=4, reach=4; score=52.5.
Wysoka ważność może współistnieć z wysokim kosztem i długim czasem.
Nie dodawaj uzasadnień, kwot ani dat do assessment. Score oblicza kod.
"""
