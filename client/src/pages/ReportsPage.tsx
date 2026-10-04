import { Plus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';
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
  const { reports, catalog, loading, error } = useReportsData();
  const [searchParams, setSearchParams] = useSearchParams();
  const districts = catalog.districts
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, 'pl'));
  const categories = catalog.categories
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, 'pl'));
  const query = searchParams.get('q') ?? '';
  const residentDistrict = user?.district ?? 'all';
  const defaultDistrict = districts.includes(residentDistrict)
    ? residentDistrict
    : 'all';
  const district = searchParams.get('district') ?? defaultDistrict;
  const category = searchParams.get('category') ?? 'all';
  const statusParam = searchParams.get('status');
  const status = isReportStatus(statusParam) ? statusParam : 'all';
  const sort =
    searchParams.get('sort') === 'najstarsze' ? 'najstarsze' : 'najnowsze';

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (key === 'district' && value === 'all') next.set(key, value);
    else if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  }

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pl');

    return reports
      .filter((report) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            report.title,
            report.description,
            report.district,
            report.category,
          ].some((value) =>
            value.toLocaleLowerCase('pl').includes(normalizedQuery),
          );
        return (
          matchesQuery &&
          (district === 'all' || report.district === district) &&
          (category === 'all' || report.category === category) &&
          (status === 'all' || report.status === status)
        );
      })
      .sort((a, b) => {
        const difference =
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return sort === 'najstarsze' ? -difference : difference;
      });
  }, [category, district, query, reports, sort, status]);

  const hasFilters = Boolean(
    query || district !== 'all' || category !== 'all' || status !== 'all',
  );

  return (
    <PageMain className={uiTheme.layout.content}>
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
        <Link
          className={uiTheme.button.primary}
          to={user ? '/dodaj-pomysl' : '/logowanie'}
        >
          <Plus size={17} /> Dodaj zgłoszenie
        </Link>
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
              placeholder="Nazwa, opis, dzielnica..."
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
            <strong className="text-slate-950">{filteredReports.length}</strong>{' '}
            zgłoszeń
          </p>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Sortowanie
            <select
              className={`${uiTheme.field} h-9 w-auto rounded-lg py-0 text-xs font-medium`}
              onChange={(event) => setFilter('sort', event.target.value)}
              value={sort}
            >
              <option value="najnowsze">Najnowsze</option>
              <option value="najstarsze">Najstarsze</option>
            </select>
          </label>
        </div>

        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
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
      </section>
    </PageMain>
  );
}
