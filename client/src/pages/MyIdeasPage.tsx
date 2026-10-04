import {
  CheckCircle2,
  Lightbulb,
  Plus,
  RefreshCw,
  ThumbsUp,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../api/client';
import { loadReports } from '../api/reports';
import { PageMain } from '../components/PageMain';
import { IDEA_STATUS_OPTIONS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { IdeaStatus, Report } from '../types/domain';

const ideaFilters: Array<{ value: 'all' | IdeaStatus; label: string }> = [
  { value: 'all', label: 'Wszystkie' },
  ...IDEA_STATUS_OPTIONS,
];

export function MyIdeasPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [ideas, setIdeas] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const result = await loadReports({ authoredByMe: true, pageSize: 100 });
      setIdeas(
        result.reports.filter(
          (_report, index) => result.ideas[index].authorId === user.id,
        ),
      );
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);
  const requestedStatus = searchParams.get('status');
  const activeStatus = IDEA_STATUS_OPTIONS.some(
    (option) => option.value === requestedStatus,
  )
    ? (requestedStatus as IdeaStatus)
    : null;
  const filteredIdeas = activeStatus
    ? ideas.filter((idea) => idea.status === activeStatus)
    : ideas;
  const activeFilter = activeStatus ?? 'all';
  const analysisStatus = searchParams.get('analiza');
  const score = searchParams.get('wynik');
  const duplicateCount = Number(searchParams.get('duplikaty') ?? 0);
  const decision = searchParams.get('decyzja');
  const relatedCount = Number(searchParams.get('powiazane') ?? 1);
  const decisionReason = searchParams.get('powod');
  const createdCount = Number(searchParams.get('utworzone') ?? 1);

  return (
    <PageMain aria-busy={loading} className={uiTheme.layout.content}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`${uiTheme.text.heading} text-3xl md:text-4xl`}>
            Moje pomysły
          </h1>
          <p className={`${uiTheme.text.muted} mt-2`}>
            Pomysły przypisane do Twojego konta mieszkańca.
          </p>
        </div>
        <Link className={uiTheme.button.primary} to="/dodaj-pomysl">
          <Plus size={17} /> Dodaj pomysł
        </Link>
      </div>

      {searchParams.get('dodano') === 'true' && (
        <section
          aria-live="polite"
          className="mt-6 rounded-2xl bg-emerald-100 p-4 text-emerald-950"
          role="status"
        >
          <div className="flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 size={19} />{' '}
            {createdCount > 1
              ? `Zgłoszenie rozdzielono i zapisano jako ${createdCount} pomysły.`
              : 'Pomysł został przeanalizowany i zapisany.'}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 pl-8 text-xs text-emerald-900">
            {analysisStatus === 'no_concepts' ? (
              <span>Nie wykryto odrębnej koncepcji w opisie.</span>
            ) : (
              <>
                {score && <span>Orientacyjny priorytet: {score}/100</span>}
                <span>
                  {decision === 'duplicate'
                    ? 'Połączono z istniejącym pomysłem'
                    : 'Utworzono nowy pomysł'}
                </span>
                {decision === 'duplicate' && Number.isFinite(relatedCount) && (
                  <span>Powiązane zgłoszenia: {relatedCount}</span>
                )}
                {decision !== 'duplicate' && (
                  <span>
                    Podobne koncepcje:{' '}
                    {Number.isFinite(duplicateCount) ? duplicateCount : 0}
                  </span>
                )}
              </>
            )}
          </div>
          {decisionReason && (
            <p className="mt-2 pl-8 text-xs leading-5 text-emerald-900">
              {decisionReason}
            </p>
          )}
        </section>
      )}

      {error && (
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"
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
      {loading && <p className="mt-6 text-sm text-slate-500">Ładowanie…</p>}

      <nav aria-label="Filtry pomysłów" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {ideaFilters.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count =
              filter.value === 'all'
                ? ideas.length
                : ideas.filter((idea) => idea.status === filter.value).length;

            return (
              <li key={filter.value}>
                <Link
                  aria-current={isActive ? 'page' : undefined}
                  className={`${uiTheme.focusRing} inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-800'
                  }`}
                  to={`/moje-pomysly?status=${filter.value}`}
                >
                  {filter.label}
                  <span
                    className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {filteredIdeas.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {filteredIdeas.map((idea) => {
            const status = IDEA_STATUS_OPTIONS.find(
              (item) => item.value === idea.status,
            );
            return (
              <Link
                className={`${uiTheme.surface.card} group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md`}
                key={idea.id}
                to={`/pomysly/${idea.id}`}
              >
                {idea.image ? (
                  <img
                    alt={`Zdjęcie do pomysłu: ${idea.title}`}
                    className="h-44 w-full object-cover"
                    src={idea.image}
                  />
                ) : (
                  <div className="grid h-32 place-items-center bg-blue-50 text-blue-300">
                    <Lightbulb size={35} />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className={uiTheme.badge.info}>{idea.district}</span>
                    <span className={uiTheme.badge.neutral}>
                      {idea.category}
                    </span>
                    {idea.duplicateOfId && (
                      <span className={uiTheme.badge.warning}>Duplikat</span>
                    )}
                  </div>
                  <h2 className="mt-4 font-semibold">{idea.title}</h2>
                  <p className={`${uiTheme.text.body} mt-2 line-clamp-3`}>
                    {idea.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 ${uiTheme.status[idea.status]}`}
                    >
                      {status?.label}
                    </span>
                    <time className="text-app-text-subtle">
                      {new Intl.DateTimeFormat('pl-PL').format(
                        new Date(idea.updatedAt),
                      )}
                    </time>
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-800">
                    <ThumbsUp size={13} /> {idea.votes} poparć
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <section
          className={`${uiTheme.surface.card} mt-7 grid min-h-72 place-items-center p-8 text-center`}
        >
          <div>
            <Lightbulb className="mx-auto text-slate-300" size={40} />
            <h2 className="mt-4 text-lg font-semibold">
              {activeStatus
                ? 'Brak pomysłów z wybranym statusem'
                : 'Nie masz jeszcze własnych pomysłów'}
            </h2>
            <p className={`${uiTheme.text.muted} mt-2`}>
              {activeStatus
                ? 'Wybierz inny filtr lub pokaż wszystkie swoje pomysły.'
                : 'Dodaj pierwszy pomysł i zobacz go na tej liście.'}
            </p>
            {activeStatus ? (
              <Link
                className={`${uiTheme.button.secondary} mt-5`}
                to="/moje-pomysly?status=all"
              >
                Pokaż wszystkie
              </Link>
            ) : (
              <Link
                className={`${uiTheme.button.secondary} mt-5`}
                to="/dodaj-pomysl"
              >
                <Plus size={16} /> Dodaj pomysł
              </Link>
            )}
          </div>
        </section>
      )}
    </PageMain>
  );
}
