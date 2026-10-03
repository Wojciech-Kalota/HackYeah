import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { uiTheme } from '../styles/theme';

const roles = [
  {
    title: 'Widok mieszkańca',
    description:
      'Zgłaszaj problemy, wspieraj pomysły i śledź działania miasta.',
    icon: UserRound,
    to: '/mieszkaniec',
    iconClass: 'bg-blue-100 text-blue-800',
    hoverClass: 'hover:border-blue-300 hover:shadow-blue-900/10',
  },
  {
    title: 'Widok administratora',
    description:
      'Zarządzaj zgłoszeniami, aktualizuj statusy i publikuj odpowiedzi.',
    icon: ShieldCheck,
    to: '/administrator',
    iconClass: 'bg-emerald-100 text-emerald-800',
    hoverClass: 'hover:border-emerald-300 hover:shadow-emerald-900/10',
  },
] as const;

export function StartPage() {
  return (
    <main
      className={`${uiTheme.layout.page} grid place-items-center px-4 py-10`}
    >
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-800/20">
            <img
              alt=""
              className="h-11 w-9 object-contain mix-blend-screen"
              src="/st-marys-logo.png"
            />
          </div>
          <p className="mt-5 text-sm font-bold tracking-[0.18em] text-blue-800 uppercase">
            Głos Miasta · Kraków
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Wybierz swój widok
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Przejdź do panelu mieszkańca lub panelu administracyjnego, aby
            rozpocząć pracę z platformą.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-2xl gap-5 sm:grid-cols-2">
          {roles.map(
            ({ title, description, icon: Icon, to, iconClass, hoverClass }) => (
              <Link
                className={`${uiTheme.surface.card} ${hoverClass} group flex aspect-square flex-col justify-between p-6 transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none`}
                key={title}
                to={to}
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl ${iconClass}`}
                >
                  <Icon size={27} />
                </span>
                <span>
                  <span className="block text-xl font-bold">{title}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-500">
                    {description}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                  Przejdź dalej
                  <ArrowRight
                    className="transition-transform group-hover:translate-x-1"
                    size={17}
                  />
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
