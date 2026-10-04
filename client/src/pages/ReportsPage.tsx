import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  ThumbsUp,
} from 'lucide-react';
import { useDeferredValue } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { useReportsData } from '../api/useReports';
import { PageMain } from '../components/PageMain';
import { ReportCard, statusLabels } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import type { ReportStatus } from '../types/domain';

const statuses = Object.keys(statusLabels) as ReportStatus[];

function isReportStatus(value: string | null): value is ReportStatus {
  return value !== null && statuses.includes(value as ReportStatus);
}

export function ReportsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const deferredQuery = useDeferredValue(query);
  const district = searchParams.get('district') ?? user?.district ?? 'all';
  const category = searchParams.get('category') ?? 'all';
  const statusParam = searchParams.get('status');
  const status = isReportStatus(statusParam) ? statusParam : 'all';
  const upVotedByMe = user ? searchParams.get('poparte') === 'true' : false;
  const requestedPage = Number(searchParams.get('page') ?? 1);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 10;
  const { reports, catalog, loading, error, pagination, reload } =
    useReportsData({
      district: district === 'all' ? undefined : district,
      category: category === 'all' ? undefined : category,
      status: status === 'all' ? undefined : status,
      upVotedByMe,
      query: deferredQuery,
      page,
      pageSize,
    });
  const districts = catalog.districts
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, 'pl'));
  const categories = catalog.categories
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, 'pl'));
  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (key === 'district' && value === 'all') next.set(key, value);
    else if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  }

  const hasFilters = Boolean(
    query ||
    district !== 'all' ||
    category !== 'all' ||
    status !== 'all' ||
    upVotedByMe,
  );

  return (
    <PageMain aria-busy={loading} className={uiTheme.layout.content}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`${uiTheme.text.heading} text-3xl md:text-4xl`}>
            Pomysły mieszkańców
          </h1>
          <p className={`${uiTheme.text.body} mt-2 max-w-2xl`}>
            Przeglądaj problemy i inicjatywy zgłoszone w krakowskich
            dzielnicach. Filtruj je według miejsca, kategorii lub etapu
            realizacji.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={uiTheme.button.secondary}
            disabled={loading}
            onClick={() => void reload()}
            type="button"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={17} />
            Odśwież
          </button>
          <Link
            className={uiTheme.button.primary}
            to={user ? '/dodaj-pomysl' : '/logowanie'}
          >
            <Plus size={17} /> Dodaj zgłoszenie
          </Link>
        </div>
      </div>

      {searchParams.get('nowe') === 'true' && (
        <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-blue-800 p-5 text-white">
          <div>
            <p className="font-semibold">Kreator nowego zgłoszenia</p>
            <p className="mt-1 text-xs text-blue-100">
              Opisz swoją inicjatywę i przekaż ją do oceny miasta.
            </p>
          </div>
          <Link
            className={`${uiTheme.button.secondary} bg-white px-4 py-2 text-xs`}
            to={user ? '/dodaj-pomysl' : '/logowanie'}
          >
            Rozpocznij
          </Link>
        </section>
      )}

      <section className={`${uiTheme.surface.card} mt-7 p-4 md:p-5`}>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={17} className="text-blue-800" /> Filtry
          zgłoszeń
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,1fr)_auto]">
          <label className="relative">
            <span className="sr-only">Szukaj zgłoszeń</span>
            <Search
              className="text-app-text-subtle absolute top-1/2 left-3 -translate-y-1/2"
              size={17}
            />
            <input
              className={`${uiTheme.field} pl-10`}
              onChange={(event) => setFilter('q', event.target.value)}
              placeholder="Tytuł lub opis..."
              type="search"
              value={query}
            />
          </label>
          <label>
            <span className="sr-only">Dzielnica</span>
            <select
              className={uiTheme.field}
              onChange={(event) => setFilter('district', event.target.value)}
              value={district}
            >
              <option value="all">Wszystkie dzielnice</option>
              {districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Kategoria</span>
            <select
              className={uiTheme.field}
              onChange={(event) => setFilter('category', event.target.value)}
              value={category}
            >
              <option value="all">Wszystkie kategorie</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Status</span>
            <select
              className={uiTheme.field}
              onChange={(event) => setFilter('status', event.target.value)}
              value={status}
            >
              <option value="all">Wszystkie statusy</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabels[item]}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`${uiTheme.button.ghost} h-11 px-3 text-xs`}
            disabled={!hasFilters}
            onClick={() =>
              setSearchParams(user ? { district: 'all' } : {}, {
                replace: true,
              })
            }
            type="button"
          >
            <RotateCcw size={15} /> Wyczyść
          </button>
        </div>
        {user && (
          <button
            aria-pressed={upVotedByMe}
            className={`${upVotedByMe ? uiTheme.button.primary : uiTheme.button.secondary} mt-3 px-4 py-2 text-xs`}
            onClick={() => setFilter('poparte', upVotedByMe ? 'all' : 'true')}
            type="button"
          >
            <ThumbsUp size={15} /> Poparte przeze mnie
          </button>
        )}
      </section>

      <section className="mt-6">
        {error && (
          <p className="mb-4 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="mb-4 text-sm text-slate-500">Ładowanie…</p>}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Znaleziono{' '}
            <strong className="text-slate-950">{pagination.totalCount}</strong>{' '}
            zgłoszeń
          </p>
          {pagination.totalCount > 0 && (
            <p className="text-xs text-slate-500">
              Strona {pagination.currentPage} z {pagination.totalPages}
            </p>
          )}
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                onVoteChanged={() => void reload()}
                report={report}
              />
            ))}
          </div>
        ) : (
          <div
            className={`${uiTheme.surface.card} grid min-h-64 place-items-center p-8 text-center`}
          >
            <div>
              <Search className="mx-auto text-slate-300" size={36} />
              <h2 className="mt-4 font-semibold">Brak pasujących zgłoszeń</h2>
              <p className="mt-1 text-sm text-slate-500">
                Zmień lub wyczyść wybrane filtry.
              </p>
            </div>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <nav
            aria-label="Paginacja pomysłów"
            className="mt-6 flex items-center justify-center gap-3"
          >
            <button
              aria-label="Poprzednia strona"
              className={`${uiTheme.button.secondary} px-3`}
              disabled={loading || pagination.currentPage <= 1}
              onClick={() =>
                setFilter('page', String(pagination.currentPage - 1))
              }
              type="button"
            >
              <ChevronLeft size={17} /> Poprzednia
            </button>
            <span className="min-w-24 text-center text-sm text-slate-600">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              aria-label="Następna strona"
              className={`${uiTheme.button.secondary} px-3`}
              disabled={
                loading || pagination.currentPage >= pagination.totalPages
              }
              onClick={() =>
                setFilter('page', String(pagination.currentPage + 1))
              }
              type="button"
            >
              Następna <ChevronRight size={17} />
            </button>
          </nav>
        )}
      </section>
    </PageMain>
  );
}
