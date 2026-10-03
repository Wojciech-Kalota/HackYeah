import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth, type LoginData } from '../auth/AuthContext';
import { uiTheme } from '../styles/theme';

const demoAccount: LoginData = {
  firstName: 'Igor',
  lastName: 'Nowak',
  district: 'V Krowodrza',
  password: 'demo1234',
};

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const destination =
    (location.state as { from?: string } | null)?.from ?? '/mieszkaniec';

  if (user) return <Navigate replace to="/mieszkaniec" />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login({ ...demoAccount, password });
    navigate(destination, { replace: true });
  }

  function handleDemoLogin() {
    setEmail('mieszkaniec@krakow.pl');
    setPassword(demoAccount.password);
    login(demoAccount);
    navigate(destination, { replace: true });
  }

  return (
    <main
      className={`${uiTheme.layout.page} relative min-h-dvh overflow-x-hidden`}
    >
      <div className="pointer-events-none absolute -top-32 -left-28 size-96 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-40 size-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-3 py-3 sm:px-4 md:px-6 md:py-4">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(30,50,100,0.08)] sm:rounded-3xl lg:h-[calc(100dvh-2rem)] lg:max-h-[760px] lg:min-h-[560px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#172d68_0%,#234497_65%,#3746b0_100%)] p-8 text-white lg:block xl:p-10">
            <div className="relative z-10 h-full">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                  <img
                    alt=""
                    className="h-8 w-10 object-contain"
                    src="/sukiennice-logo.png"
                  />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold">Głos Miasta</span>
                  <span className="block text-[9px] font-semibold tracking-[0.22em] text-blue-200 uppercase">
                    Kraków
                  </span>
                </span>
              </div>

              <div className="mt-[clamp(5rem,18vh,8rem)] w-full">
                <h1 className="max-w-md text-[clamp(2rem,3.1vw,2.5rem)] leading-[1.15] font-bold tracking-[-0.025em]">
                  <span className="block">Twój głos zmienia</span>
                  <span className="block">Kraków.</span>
                </h1>
                <p className="mt-5 max-w-[450px] text-sm leading-6 text-blue-100">
                  Zgłaszaj pomysły, wspieraj inicjatywy mieszkańców i śledź
                  działania miasta.
                </p>
              </div>
            </div>

            <img
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute right-[-31%] bottom-[-6%] h-[90%] w-[115%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%)] object-contain object-right-bottom opacity-[0.08] mix-blend-screen"
              src="/krakow-cathedral.png"
            />
            <div className="absolute -right-24 -bottom-28 size-80 rounded-full bg-white/5" />
            <div className="absolute top-28 -right-16 size-48 rounded-full bg-blue-200/[0.07] blur-sm" />
          </section>

          <section className="flex min-h-0 flex-col justify-center p-5 sm:p-7 md:p-9 lg:p-[clamp(2rem,4vw,2.75rem)]">
            <div className="mx-auto w-full max-w-md">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
                to="/"
              >
                <ArrowLeft size={16} /> Wróć do wyboru widoku
              </Link>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
                    Panel mieszkańca
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Witaj ponownie
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Podaj swoje dane, aby przejść do panelu.
                  </p>
                </div>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 lg:hidden">
                  <UserRound size={23} />
                </span>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Adres e-mail
                  </span>
                  <span className="relative block">
                    <Mail
                      className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      autoComplete="email"
                      className={`${uiTheme.field} login-field h-12 bg-[#f5f7fb] pl-11 focus:bg-white`}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="twoj@email.pl"
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
                      className={`${uiTheme.field} login-field h-12 bg-[#f5f7fb] px-11 focus:bg-white`}
                      minLength={6}
                      onChange={(event) => setPassword(event.target.value)}
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

              <div className="my-4 flex items-center gap-3 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                <span className="h-px flex-1 bg-slate-100" />
                lub szybki dostęp
                <span className="h-px flex-1 bg-slate-100" />
              </div>

              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-50/70 px-5 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200/80 transition hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                onClick={handleDemoLogin}
                type="button"
              >
                <Sparkles size={17} /> Zaloguj się jako użytkownik demo
              </button>
              <p className="mt-2 text-center text-[11px] leading-5 text-slate-400">
                Tryb demonstracyjny nie wymaga podawania danych logowania.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
