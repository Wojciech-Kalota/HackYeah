import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { statusLabels } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import { reports, type ReportStatus } from '../utils/dummyData';

type AdminStat = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  trend?: string;
};

const adminStats: AdminStat[] = [
  {
    label: 'Nowe projekty',
    value: 12,
    description: 'od ostatniego logowania',
    icon: FileText,
    iconClass: 'bg-blue-100 text-blue-800',
    trend: '+4 dziś',
  },
  {
    label: 'Do weryfikacji',
    value: 8,
    description: 'oczekuje na pierwszą ocenę',
    icon: ClipboardCheck,
    iconClass: 'bg-amber-100 text-amber-800',
  },
  {
    label: 'Bliski termin',
    value: 5,
    description: 'mniej niż 48 godzin',
    icon: CalendarClock,
    iconClass: 'bg-red-100 text-red-700',
  },
  {
    label: 'Obsłużone',
    value: 34,
    description: 'w bieżącym miesiącu',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-800',
    trend: '+18%',
  },
];

const recentProjects = [
  {
    id: 'BO-KRK-2026-184',
    title: 'Bezpieczne przejście przy ul. Wrocławskiej',
    category: 'Bezpieczeństwo',
    submitted: 'Dzisiaj, 09:42',
    status: 'Nowy',
    statusClass: 'bg-blue-50 text-blue-800 ring-blue-100',
  },
  {
    id: 'BO-KRK-2026-183',
    title: 'Zielony skwer na rogu Mazowieckiej i Kmiecej',
    category: 'Zieleń miejska',
    submitted: 'Dzisiaj, 08:17',
    status: 'Nowy',
    statusClass: 'bg-blue-50 text-blue-800 ring-blue-100',
  },
  {
    id: 'BO-KRK-2026-179',
    title: 'Stojaki rowerowe przy Parku Krakowskim',
    category: 'Mobilność',
    submitted: 'Wczoraj, 16:35',
    status: 'Do uzupełnienia',
    statusClass: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
] as const;

const navigation: Array<{
  label: string;
  icon: LucideIcon;
  href: string;
  activeOn?: 'dashboard' | 'projects';
  badge?: string;
}> = [
  {
    label: 'Pulpit',
    icon: LayoutDashboard,
    href: '/admin/panel',
    activeOn: 'dashboard',
  },
  {
    label: 'Projekty',
    icon: Sparkles,
    href: '/admin/panel/projekty',
    activeOn: 'projects',
    badge: '8',
  },
];

function AdminLogo() {
  return (
    <Link className="flex items-center gap-3" to="/admin/panel">
      <span className="grid size-10 place-items-center rounded-xl bg-blue-800 text-white shadow-sm shadow-blue-800/20">
        <Building2 size={20} />
      </span>
      <span className="leading-tight">
        <span className="block font-bold text-blue-950">Głos Miasta</span>
        <span className="block text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Kraków
        </span>
      </span>
    </Link>
  );
}

function AdminSidebar({
  currentView,
  onClose,
}: {
  currentView: 'dashboard' | 'projects';
  onClose?: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside className="flex h-full flex-col bg-white px-4 py-5">
      <div className="flex items-center justify-between px-1">
        <AdminLogo />
        {onClose && (
          <button
            aria-label="Zamknij menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="mt-8 space-y-1" aria-label="Nawigacja panelu urzędnika">
        {navigation.map(({ label, icon: Icon, href, activeOn, badge }) => {
          const active = activeOn === currentView;

          return (
            <Link
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-blue-800 font-semibold text-white shadow-sm shadow-blue-800/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
              key={label}
              onClick={onClose}
              to={href}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
              {badge && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-slate-100 pt-4">
        {profileOpen && (
          <div className="absolute right-0 bottom-[calc(100%+8px)] left-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-xs font-bold text-slate-900">Anna Nowak</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Inspektor · K-0941
              </p>
            </div>
            <a
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              href="#ustawienia"
              onClick={() => setProfileOpen(false)}
            >
              <Settings size={16} /> Ustawienia konta
            </a>
            <Link
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              onClick={onClose}
              to="/admin"
            >
              <LogOut size={16} /> Wyloguj się
            </Link>
          </div>
        )}

        <button
          aria-expanded={profileOpen}
          className="flex w-full items-center gap-3 rounded-2xl bg-blue-50 p-2.5 text-left ring-1 ring-blue-100 transition hover:bg-blue-100"
          onClick={() => setProfileOpen((current) => !current)}
          type="button"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-800 text-xs font-bold text-white shadow-sm shadow-blue-800/20">
            AN
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-bold text-blue-950">
              Anna Nowak
            </span>
            <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-700">
              <ShieldCheck size={12} /> Tryb urzędnika
            </span>
          </span>
          <ChevronRight
            className={`shrink-0 text-blue-500 transition-transform ${profileOpen ? '-rotate-90' : 'rotate-90'}`}
            size={17}
          />
        </button>
      </div>
    </aside>
  );
}

function StatCard({ stat }: { stat: AdminStat }) {
  const Icon = stat.icon;

  return (
    <article className={`${uiTheme.surface.card} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-10 place-items-center rounded-xl ${stat.iconClass}`}
        >
          <Icon size={19} />
        </span>
        {stat.trend && (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            {stat.trend}
          </span>
        )}
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

const reportStatuses = Object.keys(statusLabels) as ReportStatus[];
const projectRegions = [
  ...new Set(reports.map((report) => report.district)),
].sort((a, b) => a.localeCompare(b, 'pl'));

function formatAdminDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function AdminProjectsView() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState<ReportStatus | 'all'>('all');

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pl');

    return reports.filter((report) => {
      const matchesQuery =
        !normalizedQuery ||
        [report.title, report.district, report.category].some((value) =>
          value.toLocaleLowerCase('pl').includes(normalizedQuery),
        );

      return (
        matchesQuery &&
        (region === 'all' || report.district === region) &&
        (status === 'all' || report.status === status)
      );
    });
  }, [query, region, status]);

  return (
    <main className={uiTheme.layout.content}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
            <FileText size={14} /> Panel urzędnika
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Projekty
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Pełna lista projektów mieszkańców przekazanych do obsługi urzędu.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100">
          <MapPin size={15} /> Dzielnica V Krowodrza
        </div>
      </div>

      <section className={`${uiTheme.surface.card} mt-7 overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div>
            <h2 className="font-bold text-slate-950">Rejestr projektów</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredReports.length} z {reports.length} projektów
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-72">
              <span className="sr-only">Szukaj projektu</span>
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className={`${uiTheme.field} pl-9`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nazwa, dzielnica, kategoria..."
                type="search"
                value={query}
              />
            </label>
            <label>
              <span className="sr-only">Filtruj po rejonie</span>
              <select
                className={uiTheme.field}
                onChange={(event) => setRegion(event.target.value)}
                value={region}
              >
                <option value="all">Wszystkie rejony</option>
                {projectRegions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filtruj po statusie</span>
              <select
                className={uiTheme.field}
                onChange={(event) =>
                  setStatus(event.target.value as ReportStatus | 'all')
                }
                value={status}
              >
                <option value="all">Wszystkie statusy</option>
                {reportStatuses.map((item) => (
                  <option key={item} value={item}>
                    {statusLabels[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="px-5 py-3.5">Numer</th>
                <th className="px-4 py-3.5">Projekt</th>
                <th className="px-4 py-3.5">Dzielnica</th>
                <th className="px-4 py-3.5">Kategoria</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Poparcie</th>
                <th className="px-4 py-3.5">Aktualizacja</th>
                <th className="w-14 px-4 py-3.5">
                  <span className="sr-only">Akcje</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr
                  className="group transition hover:bg-blue-50/40"
                  key={report.id}
                >
                  <td className="px-5 py-4 text-xs font-bold whitespace-nowrap text-blue-700">
                    BO-{String(report.id).padStart(3, '0')}
                  </td>
                  <td className="max-w-sm px-4 py-4">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {report.title}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-slate-400">
                      {report.description}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium whitespace-nowrap text-slate-600">
                    {report.district}
                  </td>
                  <td className="px-4 py-4 text-xs whitespace-nowrap text-slate-600">
                    {report.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${uiTheme.status[report.status]}`}
                    >
                      {statusLabels[report.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-slate-800">
                    {report.support}
                  </td>
                  <td className="px-4 py-4 text-xs whitespace-nowrap text-slate-500">
                    {formatAdminDate(report.updatedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      aria-label={`Otwórz projekt BO-${String(report.id).padStart(3, '0')}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-blue-800 hover:shadow-sm"
                      type="button"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <Search className="mx-auto text-slate-300" size={32} />
              <h3 className="mt-3 text-sm font-bold text-slate-800">
                Brak pasujących projektów
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Zmień wyszukiwaną frazę lub wybrany status.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export function AdminPage({
  view = 'dashboard',
}: {
  view?: 'dashboard' | 'projects';
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={uiTheme.layout.page}>
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 lg:block">
        <AdminSidebar currentView={view} />
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Zamknij menu"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div className="relative h-full w-72 shadow-2xl">
            <AdminSidebar
              currentView={view}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="px-4 pt-4 lg:hidden">
          <button
            aria-label="Otwórz menu"
            className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>

        {view === 'projects' ? (
          <AdminProjectsView />
        ) : (
          <main className={uiTheme.layout.content} id="pulpit">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
                  <LayoutDashboard size={14} /> Pulpit urzędnika
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Dzień dobry, Anno
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Najważniejsze sprawy i projekty z Twojego rejonu w jednym
                  miejscu.
                </p>
              </div>

              <section className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-sm ring-1 ring-slate-200/70 xl:min-w-[350px]">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                  <MapPin size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Twój rejon odpowiedzialności
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
                    Dzielnica V Krowodrza
                  </p>
                </div>
                <button
                  aria-label="Zmień rejon"
                  className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-800"
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </section>
            </div>

            <section
              className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Podsumowanie"
            >
              {adminStats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
              <section
                className={`${uiTheme.surface.card} overflow-hidden`}
                id="nowe"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      Najnowsze projekty
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Ostatnie zgłoszenia z Dzielnicy V Krowodrza
                    </p>
                  </div>
                  <Link
                    className="text-xs font-bold text-blue-800 hover:text-blue-950"
                    to="/admin/panel/projekty"
                  >
                    Zobacz wszystkie
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentProjects.map((project) => (
                    <article
                      className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center"
                      key={project.id}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800">
                        <FileText size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-700">
                            {project.id}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {project.category}
                          </span>
                        </div>
                        <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
                          {project.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock3 size={12} /> {project.submitted}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${project.statusClass}`}
                        >
                          {project.status}
                        </span>
                        <button
                          aria-label={`Otwórz projekt ${project.id}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-blue-800 hover:shadow-sm"
                          type="button"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="space-y-5">
                <section className={`${uiTheme.surface.card} p-5`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-950">
                        Termin odpowiedzi
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Najpilniejsze sprawy
                      </p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-xl bg-red-100 text-red-700">
                      <CalendarClock size={17} />
                    </span>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          Do 24 godzin
                        </span>
                        <span className="font-bold text-red-700">2 sprawy</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-2/5 rounded-full bg-red-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          Do 48 godzin
                        </span>
                        <span className="font-bold text-amber-700">
                          3 sprawy
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-3/5 rounded-full bg-amber-500" />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl bg-blue-950 p-5 text-white shadow-lg shadow-blue-950/10">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
                      <CircleUserRound size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Anna Nowak</p>
                      <p className="mt-0.5 text-[11px] text-blue-200">
                        Inspektor · identyfikator K-0941
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-[10px] font-bold tracking-wider text-blue-300 uppercase">
                      Zakres decyzji
                    </p>
                    <p className="mt-2 text-xs leading-5 text-blue-100">
                      Weryfikacja formalna i przekazywanie projektów do
                      jednostek miejskich w Dzielnicy V.
                    </p>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
