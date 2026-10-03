import { CheckCircle2, Lightbulb, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { AiScoreBadge } from '../components/AiScoreBadge';
import { PageMain } from '../components/PageMain';
import { IDEA_STATUS_OPTIONS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { IdeaStatus } from '../types/domain';
import { citizenIdeas } from '../utils/dummyData';
import { getLocalIdeas } from '../utils/localIdeas';

const ideaFilters: Array<{ value: 'all' | IdeaStatus; label: string }> = [
  { value: 'all', label: 'Wszystkie' },
  ...IDEA_STATUS_OPTIONS,
];

export function MyIdeasPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const accountIdeas = citizenIdeas.map((idea) => ({
    id: `account-${idea.id}`,
    user_id: user?.id ?? 'citizen',
    district: idea.district,
    category: idea.category,
    title: idea.title,
    desc: idea.description,
    status: idea.status,
    img: idea.image,
    created_at: idea.updatedAt,
  }));
  const ideas = [...getLocalIdeas(user?.id), ...accountIdeas];
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

  return (
    <PageMain className={uiTheme.layout.content}>
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
        <div
          aria-live="polite"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-100 p-4 text-sm font-medium text-emerald-900"
          role="status"
        >
          <CheckCircle2 size={19} /> Pomysł został zapisany.
        </div>
      )}

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
                {idea.img ? (
                  <img
                    alt={`Zdjęcie do pomysłu: ${idea.title}`}
                    className="h-44 w-full object-cover"
                    src={idea.img}
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
                    <AiScoreBadge title={idea.title} />
                  </div>
                  <h2 className="mt-4 font-semibold">{idea.title}</h2>
                  <p className={`${uiTheme.text.body} mt-2 line-clamp-3`}>
                    {idea.desc}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 ${uiTheme.status[idea.status]}`}
                    >
                      {status?.label}
                    </span>
                    <time className="text-app-text-subtle">
                      {new Intl.DateTimeFormat('pl-PL').format(
                        new Date(idea.created_at),
                      )}
                    </time>
                  </div>
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
