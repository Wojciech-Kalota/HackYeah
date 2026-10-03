# Dostępność — WCAG 2.1 AA

Serwis jest rozwijany z celem zgodności z WCAG 2.1 na poziomie AA.

## Zaimplementowane mechanizmy

- semantyczne obszary strony, hierarchia nagłówków i etykiety formularzy,
- odnośnik „Przejdź do głównej treści”,
- pełna obsługa klawiaturą, widoczny fokus i zamykanie mobilnego menu klawiszem Escape,
- wzorzec ARIA Tabs dla komentarzy i duplikatów,
- `aria-current`, `aria-expanded`, nazwy przycisków ikonowych i opis tabeli,
- komunikaty `status` i `alert` dla zmian niewymagających przeniesienia fokusu,
- aktualizowane tytuły dokumentu i komunikaty po zmianie trasy SPA,
- responsywny układ bez blokowania orientacji oraz poziomy scroll dla tabeli,
- ograniczenie animacji zgodnie z `prefers-reduced-motion`,
- semantyczne tokeny kolorów i opcjonalny motyw wysokiego kontrastu.

## Kontrast podstawowych tokenów

Pary tekst/tło zmierzone według wzoru WCAG:

- tekst podstawowy pomocniczy `#475569` / `#ffffff`: 7.58:1,
- tekst subtelny `#64748b` / `#ffffff`: 4.76:1,
- kolor główny `#1e40af` / `#ffffff`: 8.72:1,
- kolor główny `#1e40af` / `#eff6ff`: 8.01:1,
- status ostrzegawczy `#9a3412` / `#ffedd5`: 6.38:1,
- status pozytywny `#065f46` / `#d1fae5`: 6.78:1.

## Kontrola przed wydaniem

Przed deklaracją pełnej zgodności należy wykonać ręcznie:

1. przejście wszystkich tras wyłącznie klawiaturą,
2. test NVDA + Firefox lub Chrome oraz VoiceOver + Safari,
3. test powiększenia tekstu do 200% i reflow przy szerokości 320 CSS px,
4. automatyczny audyt axe lub Lighthouse na rzeczywistych danych,
5. weryfikację tekstów alternatywnych zdjęć publikowanych w serwisie.

Podstawa: [WCAG 2.1](https://www.w3.org/TR/WCAG21/) oraz [W3C Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/).
