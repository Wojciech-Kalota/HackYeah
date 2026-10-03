import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { uiTheme } from '../styles/theme';

const demoCredentials = {
  email: 'admin@krakow.pl',
  password: 'demo2026',
};

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      email.trim().toLowerCase() !== demoCredentials.email ||
      password !== demoCredentials.password
    ) {
      setError('Nieprawidłowe dane. Skorzystaj z logowania demonstracyjnego.');
      return;
    }

    navigate('/admin/panel');
  }

  function handleDemoLogin() {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError('');
    navigate('/admin/panel');
  }

  return (
    <main className={`${uiTheme.layout.page} relative overflow-hidden`}>
      <div className="pointer-events-none absolute -top-32 -left-28 size-96 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-40 size-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 md:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl shadow-blue-950/10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="relative z-10">
              <Link className="inline-flex items-center gap-3" to="/">
                <span className="grid size-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Building2 size={22} />
                </span>
                <span>
                  <span className="block font-bold">Głos Miasta</span>
                  <span className="block text-[10px] font-semibold tracking-[0.2em] text-blue-200 uppercase">
                    Kraków
                  </span>
                </span>
              </Link>

              <div className="mt-20">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
                  <ShieldCheck size={14} /> Bezpieczny dostęp urzędnika
                </span>
                <h1 className="mt-6 text-4xl leading-tight font-bold tracking-tight">
                  Wspólnie dbamy o sprawy mieszkańców.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
                  Zaloguj się, aby obsługiwać zgłoszenia, aktualizować ich
                  status i publikować odpowiedzi miasta.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 text-xs text-blue-100">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-300 text-blue-950">
                <ShieldCheck size={17} />
              </span>
              <span>Dostęp wyłącznie dla upoważnionych pracowników</span>
            </div>

            <div className="absolute -right-24 -bottom-28 size-80 rounded-full bg-white/10" />
            <div className="absolute top-28 -right-16 size-48 rounded-full bg-cyan-300/10 blur-sm" />
          </section>

          <section className="flex min-h-[640px] flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-md">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
                to="/"
              >
                <ArrowLeft size={16} /> Wróć do wyboru widoku
              </Link>

              <div className="mt-9 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
                    Panel administratora
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Witaj ponownie
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Podaj dane służbowe, aby przejść do panelu.
                  </p>
                </div>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 lg:hidden">
                  <ShieldCheck size={23} />
                </span>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Adres e-mail
                  </span>
                  <span className="relative block">
                    <Mail
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      autoComplete="username"
                      className={`${uiTheme.field} h-12 pl-11`}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError('');
                      }}
                      placeholder="imie.nazwisko@krakow.pl"
                      required
                      type="email"
                      value={email}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Hasło
                  </span>
                  <span className="relative block">
                    <LockKeyhole
                      className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      autoComplete="current-password"
                      className={`${uiTheme.field} h-12 px-11`}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError('');
                      }}
                      placeholder="Wpisz hasło"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                {error && (
                  <p
                    className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700 ring-1 ring-red-100"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 text-xs">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      className="size-4 rounded border-slate-300 accent-blue-800"
                      type="checkbox"
                    />
                    Zapamiętaj mnie
                  </label>
                  <button
                    className="font-semibold text-blue-800 hover:text-blue-950"
                    type="button"
                  >
                    Nie pamiętam hasła
                  </button>
                </div>

                <button
                  className={`${uiTheme.button.primary} h-12 w-full`}
                  type="submit"
                >
                  Zaloguj się <ArrowRight size={17} />
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <span className="h-px flex-1 bg-slate-200" />
                lub szybki dostęp
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-100 px-5 text-sm font-bold text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                onClick={handleDemoLogin}
                type="button"
              >
                <Sparkles size={17} /> Demo login
              </button>
              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Tryb demonstracyjny nie wymaga podawania danych logowania.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
