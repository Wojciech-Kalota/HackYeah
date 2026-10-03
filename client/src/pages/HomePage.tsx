import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Trophy,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { PageMain } from '../components/PageMain';
import { statusLabels } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import {
  completedProject,
  reports,
  stats,
  type DashboardStatId,
} from '../utils/dummyData';

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

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  const style = statStyles[stat.id];
  const Icon = style.icon;

  return (
    <article className={`${uiTheme.surface.card} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl ${style.iconClass}`}
        >
          <Icon size={19} />
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
    </article>
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
  const district = user?.district ?? 'Wszystkie dzielnice';

  return (
    <PageMain className={uiTheme.layout.content}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className={uiTheme.text.eyebrow}>
            <LayoutDashboard size={14} /> Pulpit mieszkańca
          </div>
          <h1 className={`${uiTheme.text.heading} mt-2 text-3xl md:text-4xl`}>
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
            to="/pomysly"
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

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <section className={`${uiTheme.surface.card} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-950">
                Popularne w Twojej okolicy
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Pomysły najczęściej wspierane przez mieszkańców
              </p>
            </div>
            <Link className={`${uiTheme.text.link} text-xs`} to="/pomysly">
              Zobacz wszystkie
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {reports.slice(0, 4).map((report) => (
              <article
                className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center"
                key={report.id}
              >
                <img
                  alt={`Zdjęcie do pomysłu: ${report.title}`}
                  className="h-16 w-full rounded-xl object-cover sm:size-16 sm:shrink-0"
                  src={report.image}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-700">
                      BO-{String(report.id).padStart(3, '0')}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] font-medium text-slate-500">
                      {report.category}
                    </span>
                  </div>
                  <Link
                    className={`${uiTheme.text.link} mt-1 block truncate text-sm`}
                    to={`/pomysly/${report.id}`}
                  >
                    {report.title}
                  </Link>
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
                      <ThumbsUp size={11} /> {report.support}
                      <MessageSquare className="ml-1" size={11} />{' '}
                      {report.comments}
                    </p>
                  </div>
                  <Link
                    aria-label={`Otwórz pomysł ${report.title}`}
                    className={`${uiTheme.iconButton} size-9 hover:bg-white hover:shadow-sm`}
                    to={`/pomysly/${report.id}`}
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </article>
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
            <img
              alt={`Zdjęcie projektu: ${completedProject.title}`}
              className="mt-4 h-32 w-full rounded-xl object-cover"
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
