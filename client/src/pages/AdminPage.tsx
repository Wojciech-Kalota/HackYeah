import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { statusLabels } from '../components/ReportCard';
import { PageMain } from '../components/PageMain';
import { RouteAccessibility } from '../components/RouteAccessibility';
import { SkipLink } from '../components/SkipLink';
import { uiTheme } from '../styles/theme';
import {
  exampleIdeaRelations,
  reports,
  type ReportStatus,
} from '../utils/dummyData';

type AdminStat = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  href: string;
};

const adminStats: AdminStat[] = [
  {
    label: 'Nowe pomysły',
    value: 12,
    description: 'Od ostatniego logowania',
    icon: FileText,
    iconClass: 'bg-blue-100 text-blue-800',
    href: '/administrator/projekty?status=submitted',
  },
  {
    label: 'Zapisane do przejrzenia',
    value: 7,
    description: 'Twoja lista',
    icon: Bookmark,
    iconClass: 'bg-violet-100 text-violet-700',
    href: '/administrator/projekty?status=saved',
  },
  {
    label: 'Nierozstrzygnięte',
    value: 23,
    description: 'Wymagają decyzji',
    icon: CircleAlert,
    iconClass: 'bg-orange-100 text-orange-700',
    href: '/administrator/projekty?status=unresolved',
  },
  {
    label: 'Rozstrzygnięte',
    value: 84,
    description: 'W tym miesiącu',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-100 text-emerald-800',
    href: '/administrator/projekty?status=resolved',
  },
];

const recentProjects = [
  {
    reportId: 1,
    id: 'BO-KRK-2026-184',
    title: 'Bezpieczne przejście przy ul. Wrocławskiej',
    category: 'Bezpieczeństwo',
    submitted: 'Dzisiaj, 09:42',
    status: 'Nowy',
    statusClass: 'bg-blue-50 text-blue-800 ring-blue-100',
  },
  {
    reportId: 2,
    id: 'BO-KRK-2026-183',
    title: 'Zielony skwer na rogu Mazowieckiej i Kmiecej',
    category: 'Zieleń miejska',
    submitted: 'Dzisiaj, 08:17',
    status: 'Nowy',
    statusClass: 'bg-blue-50 text-blue-800 ring-blue-100',
  },
  {
    reportId: 3,
    id: 'BO-KRK-2026-179',
    title: 'Stojaki rowerowe przy Parku Krakowskim',
    category: 'Mobilność',
    submitted: 'Wczoraj, 16:35',
    status: 'Do uzupełnienia',
    statusClass: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
] as const;

type AdminNavigationItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  activeOn: 'dashboard' | 'projects' | 'analytics';
  filter?: AdminProjectFilter;
  badge?: string;
};

const navigationSections: Array<{
  label: string;
  items: AdminNavigationItem[];
}> = [
  {
    label: 'Główne',
    items: [
      {
        label: 'Pulpit',
        icon: LayoutDashboard,
        href: '/administrator/panel',
        activeOn: 'dashboard',
      },
    ],
  },
  {
    label: 'Pomysły',
    items: [
      {
        label: 'Wszystkie pomysły',
        icon: Sparkles,
        href: '/administrator/projekty',
        activeOn: 'projects',
        filter: 'all',
        badge: '8',
      },
      {
        label: 'Zapisane do przejrzenia',
        icon: Bookmark,
        href: '/administrator/projekty?status=saved',
        activeOn: 'projects',
        filter: 'saved',
        badge: '7',
      },
      {
        label: 'Nierozstrzygnięte',
        icon: CircleAlert,
        href: '/administrator/projekty?status=unresolved',
        activeOn: 'projects',
        filter: 'unresolved',
        badge: '23',
      },
      {
        label: 'Rozstrzygnięte',
        icon: CheckCircle2,
        href: '/administrator/projekty?status=resolved',
        activeOn: 'projects',
        filter: 'resolved',
      },
    ],
  },
  {
    label: 'Analiza',
    items: [
      {
        label: 'Statystyki',
        icon: BarChart3,
        href: '/administrator/statystyki',
        activeOn: 'analytics',
      },
    ],
  },
];

function AdminLogo() {
  return (
    <Link className="flex items-center gap-3" to="/administrator/panel">
      <span className="bg-app-primary grid size-10 place-items-center rounded-xl text-white shadow-sm shadow-blue-800/20">
        <img
          alt=""
          className="h-7 w-9 object-contain"
          src="/sukiennice-logo.png"
        />
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
  closeButtonRef,
}: {
  currentView: 'dashboard' | 'projects' | 'analytics';
  onClose?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const activeFilter =
    (new URLSearchParams(location.search).get(
      'status',
    ) as AdminProjectFilter | null) ?? 'all';

  function isNavigationItemActive(item: AdminNavigationItem) {
    if (item.activeOn !== currentView) return false;
    if (item.activeOn !== 'projects') return true;
    if (item.filter === 'all') {
      return !['saved', 'unresolved', 'resolved'].includes(activeFilter);
    }
    return (item.filter ?? 'all') === activeFilter;
  }

  return (
    <aside className="flex h-full flex-col bg-white px-4 py-5">
      <div className="flex items-center justify-between px-1">
        <AdminLogo />
        {onClose && (
          <button
            aria-label="Zamknij menu"
            className={`${uiTheme.iconButton} size-9 lg:hidden`}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="mt-8 space-y-6" aria-label="Nawigacja panelu urzędnika">
        {navigationSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              {section.label}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavigationItemActive(item);

                return (
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${uiTheme.focusRing} ${
                      active
                        ? 'bg-app-primary font-semibold text-white shadow-sm shadow-blue-800/15'
                        : 'text-app-text-muted hover:bg-app-muted hover:text-app-text'
                    }`}
                    key={item.label}
                    onClick={onClose}
                    to={item.href}
                  >
                    <Icon className="shrink-0" size={17} strokeWidth={1.9} />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`ml-auto min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative mt-auto border-t border-slate-100 pt-4">
        {profileOpen && (
          <div
            className={`${uiTheme.surface.card} absolute right-0 bottom-[calc(100%+8px)] left-0 overflow-hidden p-1.5 shadow-xl shadow-slate-900/10`}
            id="admin-profile-menu"
          >
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="text-xs font-bold text-slate-900">Anna Nowak</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Inspektor · K-0941
              </p>
            </div>
            <a
              className={`${uiTheme.button.ghost} mt-1 w-full justify-start px-3 text-xs`}
              href="#ustawienia"
              onClick={() => setProfileOpen(false)}
            >
              <Settings size={16} /> Ustawienia konta
            </a>
            <Link
              className={`${uiTheme.button.danger} w-full justify-start px-3 text-xs`}
              onClick={onClose}
              to="/administrator"
            >
              <LogOut size={16} /> Wyloguj się
            </Link>
          </div>
        )}

        <button
          aria-controls="admin-profile-menu"
          aria-expanded={profileOpen}
          className={`${uiTheme.surface.muted} ${uiTheme.focusRing} flex w-full items-center gap-3 p-2.5 text-left transition hover:bg-blue-100`}
          onClick={() => setProfileOpen((current) => !current)}
          type="button"
        >
          <span className="bg-app-primary grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white shadow-sm shadow-blue-800/20">
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
    <Link
      aria-label={`${stat.label}: ${stat.value}. ${stat.description}`}
      className={`${uiTheme.surface.card} group block p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-blue-950/[0.05] focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none`}
      to={stat.href}
    >
      <span
        className={`grid size-9 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${stat.iconClass}`}
      >
        <Icon size={18} strokeWidth={2} />
      </span>
      <strong className="mt-3 block text-[34px] leading-none font-bold tracking-[-0.03em] text-slate-950">
        {stat.value}
      </strong>
      <span className="mt-2 block text-sm leading-5 font-bold text-slate-800">
        {stat.label}
      </span>
      <span className="mt-1 block text-xs leading-4 text-slate-500">
        {stat.description}
      </span>
    </Link>
  );
}

const reportStatuses = Object.keys(statusLabels) as ReportStatus[];
type AdminProjectFilter =
  ReportStatus | 'all' | 'saved' | 'unresolved' | 'resolved';

const adminProjectFilters: AdminProjectFilter[] = [
  'all',
  'saved',
  'unresolved',
  'resolved',
  ...reportStatuses,
];
const savedProjectIds = new Set([1, 2, 3, 5, 6, 7, 8]);
const projectRegions = [
  ...new Set(reports.map((report) => report.district)),
].sort((a, b) => a.localeCompare(b, 'pl'));
const currentAdminRegion = 'Krowodrza';

type ProjectSortKey =
  'id' | 'title' | 'district' | 'category' | 'status' | 'support' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

function formatAdminDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function SortableHeader({
  activeKey,
  align = 'left',
  direction,
  label,
  onSort,
  sortKey,
}: {
  activeKey: ProjectSortKey;
  align?: 'left' | 'right';
  direction: SortDirection;
  label: string;
  onSort: (key: ProjectSortKey) => void;
  sortKey: ProjectSortKey;
}) {
  const active = activeKey === sortKey;
  const SortIcon = !active
    ? ArrowUpDown
    : direction === 'asc'
      ? ArrowUp
      : ArrowDown;

  return (
    <th
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className="px-4 py-3.5"
      scope="col"
    >
      <button
        className={`flex w-full items-center gap-1.5 rounded-md transition hover:text-blue-800 ${uiTheme.focusRing} ${
          active ? 'text-blue-800' : ''
        } ${align === 'right' ? 'justify-end' : ''}`}
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        <SortIcon size={12} strokeWidth={2.2} />
      </button>
    </th>
  );
}

function AdminProjectsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStatus = searchParams.get('status');
  const initialStatus = adminProjectFilters.includes(
    requestedStatus as AdminProjectFilter,
  )
    ? (requestedStatus as AdminProjectFilter)
    : 'all';
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState<AdminProjectFilter>(initialStatus);
  const [sortKey, setSortKey] = useState<ProjectSortKey>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pl');

    const matchingReports = reports.filter((report) => {
      const matchesQuery =
        !normalizedQuery ||
        [report.title, report.district, report.category].some((value) =>
          value.toLocaleLowerCase('pl').includes(normalizedQuery),
        );

      return (
        matchesQuery &&
        (region === 'all' ||
          (region === 'mine'
            ? report.district === currentAdminRegion
            : report.district === region)) &&
        (status === 'all' ||
          (status === 'saved'
            ? savedProjectIds.has(report.id)
            : status === 'unresolved'
              ? report.status === 'submitted' ||
                report.status === 'under_review'
              : status === 'resolved'
                ? report.status === 'accepted' ||
                  report.status === 'in_progress' ||
                  report.status === 'completed'
                : report.status === status))
      );
    });

    return [...matchingReports].sort((a, b) => {
      let comparison: number;

      switch (sortKey) {
        case 'id':
        case 'support':
          comparison = a[sortKey] - b[sortKey];
          break;
        case 'updatedAt':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'status':
          comparison = statusLabels[a.status].localeCompare(
            statusLabels[b.status],
            'pl',
          );
          break;
        default:
          comparison = a[sortKey].localeCompare(b[sortKey], 'pl', {
            sensitivity: 'base',
          });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [query, region, sortDirection, sortKey, status]);

  function handleSort(nextSortKey: ProjectSortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection('asc');
  }

  function handleStatusFilter(nextStatus: AdminProjectFilter) {
    setStatus(nextStatus);
    const nextParams = new URLSearchParams(searchParams);

    if (nextStatus === 'all') nextParams.delete('status');
    else nextParams.set('status', nextStatus);

    setSearchParams(nextParams, { replace: true });
  }

  return (
    <PageMain className={uiTheme.layout.content}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className={uiTheme.text.eyebrow}>
            <FileText size={14} /> Panel urzędnika
          </div>
          <h1 className={`${uiTheme.text.heading} mt-2 text-3xl md:text-4xl`}>
            Projekty
          </h1>
          <p className={`${uiTheme.text.body} mt-2 max-w-2xl`}>
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
                className="text-app-text-subtle absolute top-1/2 left-3 -translate-y-1/2"
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
                <option value="mine">Mój rejon — {currentAdminRegion}</option>
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
                  handleStatusFilter(event.target.value as AdminProjectFilter)
                }
                value={status}
              >
                <option value="all">Wszystkie statusy</option>
                <option value="saved">Zapisane do przejrzenia</option>
                <option value="unresolved">Nierozstrzygnięte</option>
                <option value="resolved">Rozstrzygnięte</option>
                {reportStatuses.map((item) => (
                  <option key={item} value={item}>
                    {statusLabels[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="hidden md:block">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">
              Lista projektów mieszkańców z możliwością sortowania według każdej
              kolumny
            </caption>
            <colgroup>
              <col />
              <col className="w-[120px]" />
              <col className="w-[130px]" />
              <col className="w-[80px]" />
              <col className="w-[105px]" />
              <col className="w-14" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                <SortableHeader
                  activeKey={sortKey}
                  direction={sortDirection}
                  label="Projekt"
                  onSort={handleSort}
                  sortKey="title"
                />
                <SortableHeader
                  activeKey={sortKey}
                  direction={sortDirection}
                  label="Dzielnica"
                  onSort={handleSort}
                  sortKey="district"
                />
                <SortableHeader
                  activeKey={sortKey}
                  direction={sortDirection}
                  label="Status"
                  onSort={handleSort}
                  sortKey="status"
                />
                <SortableHeader
                  activeKey={sortKey}
                  align="right"
                  direction={sortDirection}
                  label="Poparcie"
                  onSort={handleSort}
                  sortKey="support"
                />
                <SortableHeader
                  activeKey={sortKey}
                  direction={sortDirection}
                  label="Aktualizacja"
                  onSort={handleSort}
                  sortKey="updatedAt"
                />
                <th className="w-14 px-4 py-3.5" scope="col">
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
                  <td className="min-w-0 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-2 text-[10px]">
                      <span className="shrink-0 font-bold text-blue-700">
                        BO-{String(report.id).padStart(3, '0')}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="truncate font-medium text-slate-400">
                        {report.category}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {report.title}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium whitespace-nowrap text-slate-600">
                    {report.district}
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
                  <td className="truncate px-4 py-4 text-xs whitespace-nowrap text-slate-500">
                    {formatAdminDate(report.updatedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      aria-label={`Otwórz projekt BO-${String(report.id).padStart(3, '0')}`}
                      className={`${uiTheme.iconButton} size-9 hover:bg-white hover:shadow-sm`}
                      to={`/administrator/projekty/${report.id}`}
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {filteredReports.map((report) => (
            <Link
              className="group block p-4 transition hover:bg-blue-50/40"
              key={report.id}
              to={`/administrator/projekty/${report.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-blue-700">
                  BO-{String(report.id).padStart(3, '0')}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${uiTheme.status[report.status]}`}
                >
                  {statusLabels[report.status]}
                </span>
              </div>
              <h3 className="mt-2 text-sm leading-5 font-bold text-slate-900">
                {report.title}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {report.district}
                </span>
                <span>{report.category}</span>
                <span className="ml-auto font-bold text-slate-700">
                  {report.support} głosów
                </span>
              </div>
            </Link>
          ))}
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
    </PageMain>
  );
}

function AdminProjectDetailsView() {
  const { id } = useParams();
  const report = reports.find((item) => item.id === Number(id));
  const { comments } = exampleIdeaRelations;

  if (!report) {
    return (
      <main
        className={`${uiTheme.layout.content} grid min-h-[70vh] place-items-center`}
      >
        <div className="text-center">
          <p className="text-sm font-bold text-blue-800">404</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Nie znaleziono projektu
          </h1>
          <Link
            className={`${uiTheme.button.secondary} mt-5`}
            to="/administrator/projekty"
          >
            <ArrowLeft size={16} /> Wróć do rejestru
          </Link>
        </div>
      </main>
    );
  }

  const projectNumber = `BO-${String(report.id).padStart(3, '0')}`;

  return (
    <main className={uiTheme.layout.content}>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
        to="/administrator/projekty"
      >
        <ArrowLeft size={16} /> Wróć do rejestru projektów
      </Link>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold tracking-wide text-blue-800 uppercase">
              Projekt {projectNumber}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${uiTheme.status[report.status]}`}
            >
              {statusLabels[report.status]}
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl leading-tight font-bold tracking-tight text-slate-950 md:text-3xl">
            {report.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Widok administracyjny zgłoszenia mieszkańca
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
          <MapPin size={15} /> {report.district}
        </span>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <article className={`${uiTheme.surface.card} overflow-hidden`}>
            <img
              alt="Ilustracja projektu"
              className="max-h-[420px] w-full bg-slate-100 object-cover"
              src={report.image}
            />
            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className={uiTheme.badge.info}>{report.district}</span>
                <span className={uiTheme.badge.neutral}>{report.category}</span>
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Opis pomysłu
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                {report.description} Projekt zostanie zweryfikowany pod kątem
                wykonalności, kosztów, własności terenu oraz zgodności z
                miejskimi planami inwestycyjnymi.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <CalendarDays size={15} /> Aktualizacja:{' '}
                  {formatAdminDate(report.updatedAt)}
                </span>
                <span className="flex items-center gap-2">
                  <ThumbsUp size={15} /> {report.support} głosów
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare size={15} /> {report.comments} komentarzy
                </span>
              </div>
            </div>
          </article>

          <section className={`${uiTheme.surface.card} p-5 md:p-7`}>
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
                Głos mieszkańców
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Ostatnie komentarze
              </h2>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {comments.map((comment) => (
                <article
                  className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  key={`${comment.user_id}-${comment.date}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <UserRound size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.user_id}
                      </p>
                      <time className="text-[11px] text-slate-400">
                        {formatAdminDate(comment.date)}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      {comment.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <section className={`${uiTheme.surface.card} p-5`}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-800">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="font-bold text-slate-950">
                  Decyzja administracyjna
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Zmień status, przypisz jednostkę i dodaj notatkę.
                </p>
              </div>
            </div>
            <Link
              className={`${uiTheme.button.primary} mt-5 w-full`}
              to={`/administrator/projekty/${report.id}/decyzja`}
            >
              <ShieldCheck size={16} /> Podejmij decyzję
            </Link>
          </section>

          <section className={`${uiTheme.surface.card} p-5`}>
            <h2 className="font-bold text-slate-950">Aktywność pomysłu</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-2xl font-bold text-blue-950">
                  {report.support}
                </p>
                <p className="mt-1 text-[11px] text-blue-700">Głosów</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold text-slate-950">
                  {report.comments}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Komentarzy</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function AdminProjectDecisionView() {
  const { id } = useParams();
  const report = reports.find((item) => item.id === Number(id));
  const [status, setStatus] = useState<ReportStatus>(
    report?.status ?? 'submitted',
  );
  const [unit, setUnit] = useState('Zarząd Dróg Miasta Krakowa');

  if (!report) {
    return (
      <main
        className={`${uiTheme.layout.content} grid min-h-[70vh] place-items-center`}
      >
        <div className="text-center">
          <p className="text-sm font-bold text-blue-800">404</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Nie znaleziono projektu
          </h1>
          <Link
            className={`${uiTheme.button.secondary} mt-5`}
            to="/administrator/projekty"
          >
            <ArrowLeft size={16} /> Wróć do rejestru
          </Link>
        </div>
      </main>
    );
  }

  const projectNumber = `BO-${String(report.id).padStart(3, '0')}`;

  return (
    <main className={uiTheme.layout.content}>
      <div className="mx-auto max-w-3xl">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
          to={`/administrator/projekty/${report.id}`}
        >
          <ArrowLeft size={16} /> Wróć do szczegółów projektu
        </Link>

        <div className="mt-5">
          <p className="text-xs font-bold tracking-wide text-blue-800 uppercase">
            Projekt {projectNumber}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Podejmij decyzję
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Ustal dalszy sposób obsługi pomysłu i przekaż go do właściwej
            jednostki miejskiej.
          </p>
        </div>

        <section className={`${uiTheme.surface.card} mt-6 overflow-hidden`}>
          <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-800">
              <ShieldCheck size={21} />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-slate-950">
                Decyzja administracyjna
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {report.title}
              </p>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Status projektu
                </span>
                <select
                  className={uiTheme.field}
                  onChange={(event) =>
                    setStatus(event.target.value as ReportStatus)
                  }
                  value={status}
                >
                  {reportStatuses.map((item) => (
                    <option key={item} value={item}>
                      {statusLabels[item]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Jednostka odpowiedzialna
                </span>
                <span className="relative block">
                  <Building2
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <select
                    className={`${uiTheme.field} pl-9`}
                    onChange={(event) => setUnit(event.target.value)}
                    value={unit}
                  >
                    <option>Zarząd Dróg Miasta Krakowa</option>
                    <option>Zarząd Zieleni Miejskiej</option>
                    <option>Wydział Gospodarki Komunalnej</option>
                    <option>Wydział Polityki Społecznej</option>
                  </select>
                </span>
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Notatka wewnętrzna
              </span>
              <textarea
                className={`${uiTheme.field} min-h-36 resize-y py-3`}
                placeholder="Dodaj informację dla zespołu..."
              />
              <span className="mt-2 block text-[11px] text-slate-400">
                Notatka jest widoczna wyłącznie dla pracowników urzędu.
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                className={`${uiTheme.button.secondary} sm:min-w-32`}
                to={`/administrator/projekty/${report.id}`}
              >
                Anuluj
              </Link>
              <button
                className={`${uiTheme.button.primary} sm:min-w-44`}
                type="button"
              >
                <Save size={16} /> Zapisz decyzję
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminAnalyticsView() {
  const statusSummary = reportStatuses.map((status) => ({
    status,
    label: statusLabels[status],
    value: reports.filter((report) => report.status === status).length,
  }));
  const highestValue = Math.max(...statusSummary.map((item) => item.value), 1);

  return (
    <main className={uiTheme.layout.content}>
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
        <BarChart3 size={14} /> Analiza
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        Statystyki pomysłów
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Podsumowanie aktywności mieszkańców i etapów obsługi zgłoszeń.
      </p>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className={`${uiTheme.surface.card} mt-7 p-5 md:p-6`}>
        <h2 className="font-bold text-slate-950">Pomysły według statusu</h2>
        <p className="mt-1 text-xs text-slate-500">
          Rozkład projektów dostępnych w bieżącym rejestrze
        </p>
        <div className="mt-6 space-y-4">
          {statusSummary.map((item) => (
            <div key={item.status}>
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="font-semibold text-slate-700">
                  {item.label}
                </span>
                <span className="font-bold text-slate-950">{item.value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-700"
                  style={{ width: `${(item.value / highestValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export function AdminPage({
  view = 'dashboard',
}: {
  view?: 'dashboard' | 'projects' | 'project' | 'decision' | 'analytics';
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarView =
    view === 'dashboard'
      ? 'dashboard'
      : view === 'analytics'
        ? 'analytics'
        : 'projects';
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  useEffect(() => {
    if (!menuOpen) return;
    closeButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  return (
    <div className={uiTheme.layout.page}>
      <RouteAccessibility />
      <SkipLink />
      <div className="border-app-border fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:block">
        <AdminSidebar currentView={sidebarView} />
      </div>
      {menuOpen && (
        <div
          aria-label="Menu panelu urzędnika"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
        >
          <button
            aria-label="Zamknij menu"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={closeMenu}
            type="button"
          />
          <div className="relative h-full w-72 shadow-2xl">
            <AdminSidebar
              closeButtonRef={closeButtonRef}
              currentView={sidebarView}
              onClose={closeMenu}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-64" inert={menuOpen}>
        <div className="px-4 pt-4 lg:hidden">
          <button
            aria-label="Otwórz menu"
            className={`${uiTheme.iconButton} bg-app-surface ring-app-border shadow-sm ring-1`}
            onClick={() => setMenuOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>

        {view === 'projects' ? (
          <AdminProjectsView />
        ) : view === 'project' ? (
          <AdminProjectDetailsView />
        ) : view === 'decision' ? (
          <AdminProjectDecisionView />
        ) : view === 'analytics' ? (
          <AdminAnalyticsView />
        ) : (
          <PageMain className={uiTheme.layout.content}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className={uiTheme.text.eyebrow}>
                  <LayoutDashboard size={14} /> Pulpit urzędnika
                </div>
                <h1
                  className={`${uiTheme.text.heading} mt-2 text-3xl md:text-4xl`}
                >
                  Dzień dobry, Anno
                </h1>
                <p className={`${uiTheme.text.body} mt-2 max-w-2xl`}>
                  Najważniejsze sprawy i projekty z Twojego rejonu w jednym
                  miejscu.
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
                    Twój rejon odpowiedzialności
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
                    Dzielnica V Krowodrza
                  </p>
                </div>
                <button
                  aria-label="Zmień rejon"
                  className={`${uiTheme.iconButton} ml-auto size-9`}
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </section>
            </div>

            <section
              className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              aria-label="Podsumowanie"
            >
              {adminStats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <div className="mt-7">
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
                    to="/administrator/projekty"
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
                        <p className="text-app-text-subtle mt-1 flex items-center gap-1 text-[11px]">
                          <Clock3 size={12} /> {project.submitted}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${project.statusClass}`}
                        >
                          {project.status}
                        </span>
                        <Link
                          aria-label={`Otwórz projekt ${project.id}`}
                          className={`${uiTheme.iconButton} size-9 hover:bg-white hover:shadow-sm`}
                          to={`/administrator/projekty/${project.reportId}`}
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </PageMain>
        )}
      </div>
    </div>
  );
}
