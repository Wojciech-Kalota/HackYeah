import { Plus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ReportCard, statusLabels } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import { reports, type ReportStatus } from '../utils/dummyData';

const districts = [...new Set(reports.map((report) => report.district))].sort();
const categories = [
  ...new Set(reports.map((report) => report.category)),
].sort();
const statuses = Object.keys(statusLabels) as ReportStatus[];

function isReportStatus(value: string | null): value is ReportStatus {
  return value !== null && statuses.includes(value as ReportStatus);
}

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const district = searchParams.get('district') ?? 'all';
  const category = searchParams.get('category') ?? 'all';
  const statusParam = searchParams.get('status');
  const status = isReportStatus(statusParam) ? statusParam : 'all';
  const sort =
    searchParams.get('sort') === 'popularne' ? 'popularne' : 'najnowsze';

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
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
      .sort((a, b) =>
        sort === 'popularne'
          ? b.support - a.support
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [category, district, query, sort, status]);

  const hasFilters = Boolean(
    query || district !== 'all' || category !== 'all' || status !== 'all',
  );

  return (
    <main className={uiTheme.layout.content}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
            Baza zgłoszeń
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Pomysły mieszkańców
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Przeglądaj problemy i inicjatywy zgłoszone w krakowskich
            dzielnicach. Filtruj je według miejsca, kategorii lub etapu
            realizacji.
          </p>
        </div>
        <button className={uiTheme.button.primary} type="button">
          <Plus size={17} /> Dodaj zgłoszenie
        </button>
      </div>

      {searchParams.get('nowe') === 'true' && (
        <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-blue-800 p-5 text-white">
          <div>
            <p className="font-semibold">Kreator nowego zgłoszenia</p>
            <p className="mt-1 text-xs text-blue-100">
              To miejsce jest przygotowane pod kolejny ekran formularza lub
              asystenta AI.
            </p>
          </div>
          <button
            className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-blue-900"
            type="button"
          >
            Rozpocznij
          </button>
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
              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasFilters}
            onClick={() => setSearchParams({}, { replace: true })}
            type="button"
          >
            <RotateCcw size={15} /> Wyczyść
          </button>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Znaleziono{' '}
            <strong className="text-slate-950">{filteredReports.length}</strong>{' '}
            zgłoszeń
          </p>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Sortowanie
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 outline-none"
              onChange={(event) => setFilter('sort', event.target.value)}
              value={sort}
            >
              <option value="najnowsze">Najnowsze</option>
              <option value="popularne">Najpopularniejsze</option>
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
    </main>
  );
}
