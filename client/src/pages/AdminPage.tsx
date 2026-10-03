import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { uiTheme } from '../styles/theme';

export function AdminPage() {
  return (
    <main
      className={`${uiTheme.layout.page} grid place-items-center px-4 py-10`}
    >
      <section
        className={`${uiTheme.surface.card} w-full max-w-xl p-8 text-center`}
      >
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
          <ShieldCheck size={27} />
        </span>
        <p className="mt-5 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
          Panel administratora
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Widok w przygotowaniu
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          To miejsce jest gotowe pod kolejny ekran obsługi zgłoszeń przez
          pracowników miasta.
        </p>
        <Link className={`${uiTheme.button.secondary} mt-7`} to="/">
          <ArrowLeft size={16} /> Wróć do wyboru widoku
        </Link>
      </section>
    </main>
  );
}
