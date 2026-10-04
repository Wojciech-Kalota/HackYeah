import { CheckCircle2, Contrast, Keyboard } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PageMain } from '../components/PageMain';
import { uiTheme } from '../styles/theme';

const THEME_STORAGE_KEY = 'e-inicjatywa:theme';
const LEGACY_THEME_STORAGE_KEY = 'glos-miasta:theme';

export function AccessibilityPage() {
  const [highContrast, setHighContrast] = useState(
    () => document.documentElement.dataset.theme === 'contrast',
  );

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(THEME_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (savedTheme !== 'contrast') return;
    localStorage.setItem(THEME_STORAGE_KEY, savedTheme);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    document.documentElement.dataset.theme = 'contrast';
    setHighContrast(true);
  }, []);

  function toggleContrast() {
    const enabled = !highContrast;
    setHighContrast(enabled);
    if (enabled) {
      document.documentElement.dataset.theme = 'contrast';
      localStorage.setItem(THEME_STORAGE_KEY, 'contrast');
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    }
  }

  return (
    <PageMain className={`${uiTheme.layout.content} max-w-5xl`}>
      <h1 className={`${uiTheme.text.heading} text-3xl md:text-4xl`}>
        Informacje o dostępności
      </h1>
      <p className={`${uiTheme.text.body} mt-3 max-w-3xl`}>
        Serwis został zaprojektowany zgodnie z WCAG 2.1 na poziomie AA. Poniżej
        znajdują się dostępne ułatwienia i informacje o korzystaniu z serwisu.
      </p>

      <section className={`${uiTheme.surface.card} mt-7 p-5 md:p-7`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="bg-app-primary-soft text-app-primary-strong grid size-11 shrink-0 place-items-center rounded-xl">
              <Contrast size={21} />
            </span>
            <div>
              <h2 className={uiTheme.text.sectionHeading}>Wysoki kontrast</h2>
              <p className={`${uiTheme.text.body} mt-1`}>
                Zwiększa kontrast tekstów, kontrolek i obramowań w całej
                aplikacji.
              </p>
            </div>
          </div>
          <button
            aria-pressed={highContrast}
            className={
              highContrast ? uiTheme.button.primary : uiTheme.button.secondary
            }
            onClick={toggleContrast}
            type="button"
          >
            <Contrast size={17} />
            {highContrast ? 'Wyłącz wysoki kontrast' : 'Włącz wysoki kontrast'}
          </button>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className={`${uiTheme.surface.card} p-5 md:p-6`}>
          <Keyboard className="text-app-primary-strong" size={23} />
          <h2 className={`${uiTheme.text.sectionHeading} mt-4`}>
            Obsługa klawiaturą
          </h2>
          <ul className="text-app-text-muted mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>Widoczny fokus na elementach interaktywnych.</li>
            <li>Odnośnik pomijający nawigację boczną.</li>
            <li>Obsługa klawisza Escape w mobilnym menu.</li>
            <li>Obsługa strzałek w zakładkach komentarzy i duplikatów.</li>
          </ul>
        </section>

        <section className={`${uiTheme.surface.card} p-5 md:p-6`}>
          <CheckCircle2 className="text-emerald-700" size={23} />
          <h2 className={`${uiTheme.text.sectionHeading} mt-4`}>
            Czytniki ekranu
          </h2>
          <ul className="text-app-text-muted mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>Semantyczne nagłówki, formularze, tabele i obszary strony.</li>
            <li>Komunikaty błędów i powodzenia przekazywane automatycznie.</li>
            <li>Nazwy dostępne dla przycisków zawierających tylko ikonę.</li>
            <li>Aktualizowane tytuły i komunikaty po zmianie trasy.</li>
          </ul>
        </section>
      </div>

      <section className={`${uiTheme.surface.muted} mt-6 p-5 md:p-6`}>
        <h2 className={uiTheme.text.sectionHeading}>
          Dalsze zapewnianie dostępności
        </h2>
        <p className={`${uiTheme.text.body} mt-2`}>
          Dostępność serwisu będzie regularnie sprawdzana z użyciem klawiatury,
          czytników ekranu oraz powiększenia 200–400%. Zgłoszone trudności będą
          uwzględniane w kolejnych aktualizacjach.
        </p>
      </section>
    </PageMain>
  );
}
