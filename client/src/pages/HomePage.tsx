import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { ReportCard } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import {
  completedProject,
  reports,
  stats,
  type DashboardStatId,
} from '../utils/dummyData';

const statStyles: Record<
  DashboardStatId,
  {
    icon: LucideIcon;
    iconClass: string;
    valueClass: string;
    badgeClass: string;
  }
> = {
  submitted: {
    icon: FileText,
    iconClass: 'bg-blue-100 text-blue-800',
    valueClass: 'text-slate-950',
    badgeClass: 'bg-slate-100 text-slate-600',
  },
  under_review: {
    icon: ClipboardCheck,
    iconClass: 'bg-orange-100 text-orange-800',
    valueClass: 'text-orange-800',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
  in_progress: {
    icon: Wrench,
    iconClass: 'bg-indigo-100 text-indigo-800',
    valueClass: 'text-indigo-800',
    badgeClass: 'bg-indigo-100 text-indigo-800',
  },
  completed: {
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-800',
    valueClass: 'text-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
};

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  const style = statStyles[stat.id];
  const Icon = style.icon;

  return (
    <article className={`${uiTheme.surface.card} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl ${style.iconClass}`}
        >
          <Icon size={19} />
        </span>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${style.badgeClass}`}
        >
          {stat.badge}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <strong className={`text-3xl leading-none ${style.valueClass}`}>
          {stat.value}
        </strong>
        <span className="pb-0.5 text-xs font-medium text-slate-700">
          {stat.label}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{stat.description}</p>
    </article>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const ideaPath = user ? '/dodaj-pomysl' : '/logowanie';

  return (
    <main className={uiTheme.layout.content}>
      <section
        className={`${uiTheme.surface.card} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-800">
              <ShieldCheck size={13} /> Profil zaufany
            </span>
            <span>•</span>
            <span>{user ? `Dzielnica ${user.district}` : 'Kraków'}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Dzień dobry{user ? `, ${user.firstName}` : ''}{' '}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Masz pomysł, jak ulepszyć Kraków i swoją dzielnicę? Dołącz do
            współdecydowania o lokalnych inwestycjach miejskich.
          </p>
        </div>
        {user && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-medium text-emerald-900">
            <CheckCircle2 size={15} /> Mieszkaniec zalogowany
          </span>
        )}
      </section>

      <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 px-6 py-8 text-white shadow-lg shadow-blue-950/15 md:px-9 md:py-10">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/15">
            <span className="size-2 rounded-full bg-emerald-300" /> Budżet
            Obywatelski 2026 · Nabór trwa
          </span>
          <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            Zmień swoją dzielnicę. Twój głos ma realną moc.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
            42 mln zł czekają na inicjatywy krakowian. Opisz problem, a asystent
            pomoże przygotować kompletne zgłoszenie.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={uiTheme.button.accent} to={ideaPath}>
              <Plus size={17} /> Zgłoś nowy problem
            </Link>
            <Link
              className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/15"
              to="/pomysly"
            >
              Przeglądaj zgłoszenia <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="absolute -right-14 -bottom-24 size-80 rounded-full bg-white/10" />
        <div className="absolute top-10 right-28 hidden size-28 rounded-full bg-cyan-300/10 blur-sm md:block" />
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-800">
                TWOJA OKOLICA
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Co dzieje się w Krakowie?
              </h2>
            </div>
            <Link
              className="hidden text-sm font-semibold text-blue-800 hover:text-blue-950 sm:block"
              to="/pomysly"
            >
              Wszystkie zgłoszenia
            </Link>
          </div>
          <div className="space-y-4">
            {reports.slice(0, 3).map((report) => (
              <ReportCard compact key={report.id} report={report} />
            ))}
          </div>
          <Link
            className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-950"
            to="/pomysly"
          >
            Zobacz wszystkie zgłoszenia w Krakowie <ArrowRight size={16} />
          </Link>
        </section>

        <aside className="space-y-5">
          <article className={`${uiTheme.surface.card} overflow-hidden p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Trophy size={17} />
                </span>
                Ostatnio zrealizowane
              </h2>
              <span className="text-[10px] font-bold tracking-wide text-emerald-700">
                SUKCES
              </span>
            </div>
            <img
              alt="Zrealizowany projekt miejski"
              className="mt-4 h-36 w-full rounded-xl object-cover"
              src={completedProject.image}
            />
            <h3 className="mt-4 text-sm font-semibold">
              {completedProject.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {completedProject.description}
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-emerald-600" />
            </div>
            <p className="mt-2 text-right text-[10px] font-medium text-emerald-800">
              100% zrealizowano
            </p>
          </article>

          <article className={`${uiTheme.surface.muted} p-5`} id="standardy">
            <h2 className="flex items-start gap-2 font-bold text-blue-950">
              <ShieldCheck className="mt-0.5 shrink-0" size={19} /> Karta
              Dialogu i Przejrzystości
            </h2>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              Urząd Miasta Krakowa zobowiązuje się do standardu otwartej
              partycypacji społecznej.
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white p-3 text-xs">
                <strong>Maks. 14 dni roboczych</strong>
                <p className="mt-1 text-slate-500">
                  na pierwszą formalną ocenę wniosku.
                </p>
              </div>
              <div className="rounded-xl bg-white p-3 text-xs">
                <strong>Imienny urzędnik prowadzący</strong>
                <p className="mt-1 text-slate-500">
                  i bezpośredni kontakt w sprawie.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-blue-100 p-5 ring-1 ring-blue-200">
            <h2 className="flex items-center gap-2 font-bold text-blue-950">
              <Sparkles size={19} /> Zgłoś problem w 3 minuty
            </h2>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              Asystent dopasuje kategorię urzędową, sprawdzi kompletność
              zgłoszenia i wskaże właściwą jednostkę.
            </p>
            <Link
              className={`${uiTheme.button.primary} mt-5 w-full text-xs`}
              to={ideaPath}
            >
              <Sparkles size={15} /> Rozpocznij z Asystentem AI
            </Link>
          </article>
        </aside>
      </div>
    </main>
  );
}
