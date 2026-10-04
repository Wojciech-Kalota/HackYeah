import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  MapPin,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { useReportsData } from '../api/useReports';
import { PageMain } from '../components/PageMain';
import { statusLabels } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import type { DashboardStat, DashboardStatId } from '../types/domain';

const statStyles: Record<
  DashboardStatId,
  { icon: LucideIcon; iconClass: string }
> = {
  submitted: { icon: FileText, iconClass: 'bg-blue-100 text-blue-800' },
  under_review: {
    icon: ClipboardCheck,
    iconClass: 'bg-amber-100 text-amber-800',
  },
  in_progress: { icon: Wrench, iconClass: 'bg-indigo-100 text-indigo-800' },
  completed: {
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-800',
  },
};

const statFilters: Record<DashboardStatId, string> = {
  submitted: 'all',
  under_review: 'under_review',
  in_progress: 'in_progress',
  completed: 'completed',
};

function StatCard({ stat }: { stat: DashboardStat }) {
  const style = statStyles[stat.id];
  const Icon = style.icon;

  return (
    <Link
      aria-label={`${stat.label}: pokaż odpowiednio przefiltrowane moje pomysły`}
      className={`${uiTheme.surface.card} group block p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-blue-950/[0.05] focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none`}
      to={`/moje-pomysly?status=${statFilters[stat.id]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${style.iconClass}`}
        >
          <Icon size={19} strokeWidth={2} />
        </span>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">
          {stat.badge}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <strong className="text-3xl leading-none text-slate-950">
          {stat.value}
        </strong>
        <span className="pb-0.5 text-sm font-semibold text-slate-700">
          {stat.label}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{stat.description}</p>
    </Link>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function HomePage() {
  const { user } = useAuth();
  const { reports, ideas, loading, error, reload } = useReportsData();
  const district = user?.district ?? 'Wszystkie dzielnice';
  const myReports = reports.filter(
    (_report, index) => ideas[index]?.authorId === user?.id,
  );
  const neighborhoodReports = reports
    .filter((report) => !user?.district || report.district === user.district)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  const completedProject = neighborhoodReports.find(
    (report) => report.status === 'completed',
  );
  const stats: DashboardStat[] = [
    {
      id: 'submitted',
      label: 'Twoje zgłoszenia',
      value: myReports.length,
      description: 'Wszystkie pomysły przypisane do Twojego konta',
      badge: 'Twój wkład',
    },
    {
      id: 'under_review',
      label: 'W analizie',
      value: myReports.filter((report) => report.status === 'under_review')
        .length,
      description: 'Pomysły aktualnie oceniane przez miasto',
      badge: 'Aktywne',
    },
    {
      id: 'in_progress',
      label: 'W realizacji',
      value: myReports.filter((report) => report.status === 'in_progress')
        .length,
      description: 'Pomysły na etapie realizacji',
      badge: 'Etap prac',
    },
    {
      id: 'completed',
      label: 'Zrealizowane',
      value: myReports.filter((report) => report.status === 'completed').length,
      description: 'Zakończone pomysły mieszkańca',
      badge: 'Sukces',
    },
  ];

  return (
    <PageMain aria-busy={loading} className={uiTheme.layout.content}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className={`${uiTheme.text.heading} text-3xl md:text-4xl`}>
            Dzień dobry{user ? `, ${user.firstName}` : ''}
          </h1>
          <p className={`${uiTheme.text.body} mt-2 max-w-2xl`}>
            Pomysły, projekty i najważniejsze informacje z Twojej okolicy w
            jednym miejscu.
          </p>
        </div>

        <section
          className={`${uiTheme.surface.card} flex min-w-0 items-center gap-3 p-3 pr-5 xl:min-w-[350px]`}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <MapPin size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-app-text-subtle text-[10px] font-bold tracking-wider uppercase">
              Obserwowana okolica
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              {district}
            </p>
          </div>
          <Link
            aria-label="Przeglądaj pomysły z okolicy"
            className={`${uiTheme.iconButton} ml-auto size-9`}
            to="/pomysly?district=all"
          >
            <ChevronRight size={18} />
          </Link>
        </section>
      </div>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Podsumowanie"
      >
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {error && (
        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <p className="font-medium">{error}</p>
          <button
            className={`${uiTheme.button.ghost} px-3 py-2 text-xs text-red-800 hover:bg-red-100`}
            onClick={() => void reload()}
            type="button"
          >
            <RefreshCw size={15} /> Spróbuj ponownie
          </button>
        </div>
      )}

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <section className={`${uiTheme.surface.card} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-950">
                Najnowsze w Twojej okolicy
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ostatnio zaktualizowane pomysły mieszkańców
              </p>
            </div>
            <Link
              className={`${uiTheme.text.link} text-xs`}
              to="/pomysly?district=all"
            >
              Zobacz wszystkie
            </Link>
          </div>

          <div>
            {neighborhoodReports.slice(0, 4).map((report) => (
              <Link
                aria-label={`Otwórz pomysł ${report.title}`}
                className={`${uiTheme.focusRing} group flex flex-col gap-4 border border-transparent border-b-slate-100 px-5 py-4 transition-colors last:border-b-transparent hover:border-blue-200 sm:flex-row sm:items-center`}
                key={report.id}
                to={`/pomysly/${report.id}`}
              >
                {report.image ? (
                  <img
                    alt={`Zdjęcie do pomysłu: ${report.title}`}
                    className="h-16 w-full rounded-xl object-cover sm:size-16 sm:shrink-0"
                    src={report.image}
                  />
                ) : (
                  <span className="grid h-16 w-full place-items-center rounded-xl bg-slate-100 text-slate-400 sm:size-16 sm:shrink-0">
                    <FileText aria-hidden="true" size={20} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-500">
                      {report.category}
                    </span>
                  </div>
                  <h3 className="text-app-primary-strong mt-1 truncate text-sm font-semibold">
                    {report.title}
                  </h3>
                  <div className="text-app-text-subtle mt-1 flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {report.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} /> {formatDate(report.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${uiTheme.status[report.status]}`}
                    >
                      {statusLabels[report.status]}
                    </span>
                    <p className="text-app-text-subtle mt-1.5 flex items-center justify-end gap-1 text-[10px]">
                      <MessageSquare size={11} /> {report.comments}
                    </p>
                  </div>
                  <span className="text-app-text-muted grid size-9 place-items-center">
                    <ChevronRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className={`${uiTheme.surface.card} overflow-hidden p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-950">
                  Ostatnio zrealizowane
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Projekt mieszkańców
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <Trophy size={17} />
              </span>
            </div>
            {completedProject ? (
              <Link
                className={`${uiTheme.focusRing} mt-4 block rounded-xl`}
                to={`/pomysly/${completedProject.id}`}
              >
                {completedProject.image && (
                  <img
                    alt={`Zdjęcie projektu: ${completedProject.title}`}
                    className="h-32 w-full rounded-xl object-cover"
                    src={completedProject.image}
                  />
                )}
                <h3 className="mt-4 text-sm font-semibold">
                  {completedProject.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                  {completedProject.description}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-emerald-600" />
                </div>
              </Link>
            ) : (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {loading
                  ? 'Ładowanie danych…'
                  : 'Brak zrealizowanych projektów w wybranej okolicy.'}
              </p>
            )}
          </section>

          <section className={`${uiTheme.surface.card} p-5`} id="standardy">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-950">
                  Karta Dialogu
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Standard odpowiedzi miasta
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-800">
                <ShieldCheck size={17} />
              </span>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              Pierwsza formalna ocena pomysłu nastąpi maksymalnie w ciągu 14 dni
              roboczych.
            </p>
          </section>
        </aside>
      </div>
    </PageMain>
  );
}
