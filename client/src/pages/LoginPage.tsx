import { LockKeyhole, LogIn, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth, type LoginData } from '../auth/AuthContext';
import { KRAKOW_DISTRICTS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';

const demoAccount: LoginData = {
  firstName: 'Igor',
  lastName: 'Nowak',
  district: 'V Krowodrza',
  password: 'demo1234',
};

export function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState<LoginData>(demoAccount);
  const location = useLocation();
  const navigate = useNavigate();
  const destination =
    (location.state as { from?: string } | null)?.from ?? '/mieszkaniec';

  if (user) return <Navigate replace to="/mieszkaniec" />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login(form);
    navigate(destination, { replace: true });
  }

  return (
    <main
      className={`${uiTheme.layout.content} grid min-h-[calc(100vh-4rem)] place-items-center`}
    >
      <section
        className={`${uiTheme.surface.card} w-full max-w-lg overflow-hidden`}
      >
        <div className="bg-gradient-to-br from-blue-950 to-blue-700 px-7 py-8 text-white">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <UserRound size={24} />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            Zaloguj się jako mieszkaniec
          </h1>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            Na razie konto jest lokalne i demonstracyjne. Dane zostaną później
            podłączone do API.
          </p>
        </div>

        <form className="space-y-5 p-7" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Imię
              <input
                autoComplete="given-name"
                className={`${uiTheme.field} mt-2`}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.target.value })
                }
                required
                value={form.firstName}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Nazwisko
              <input
                autoComplete="family-name"
                className={`${uiTheme.field} mt-2`}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.target.value })
                }
                required
                value={form.lastName}
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Dzielnica
            <select
              className={`${uiTheme.field} mt-2`}
              onChange={(event) =>
                setForm({ ...form, district: event.target.value })
              }
              required
              value={form.district}
            >
              {KRAKOW_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Hasło
            <div className="relative mt-2">
              <LockKeyhole
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                autoComplete="current-password"
                className={`${uiTheme.field} pl-10`}
                minLength={6}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                required
                type="password"
                value={form.password}
              />
            </div>
          </label>
          <button className={`${uiTheme.button.primary} w-full`} type="submit">
            <LogIn size={17} /> Zaloguj się
          </button>
          <p className="text-center text-[11px] leading-5 text-slate-400">
            Hasło demonstracyjne: <strong>demo1234</strong>. Nie jest zapisywane
            w przeglądarce.
          </p>
        </form>
      </section>
    </main>
  );
}
