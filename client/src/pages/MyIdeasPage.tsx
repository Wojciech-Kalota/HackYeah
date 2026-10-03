import { CheckCircle2, FileText, Lightbulb, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { IDEA_STATUS_OPTIONS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import { mockCitizenIdeas } from '../utils/dummyData';
import { getLocalIdeas } from '../utils/localIdeas';

export function MyIdeasPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mockedIdeas = mockCitizenIdeas.map((idea) => ({
    id: `mock-${idea.id}`,
    user_id: user?.id ?? 'demo-citizen',
    district: idea.district,
    category: idea.category,
    title: idea.title,
    desc: idea.description,
    status: idea.status,
    img: idea.image,
    created_at: idea.updatedAt,
  }));
  const ideas = [...getLocalIdeas(user?.id), ...mockedIdeas];

  return (
    <main className={uiTheme.layout.content}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
            <FileText size={14} /> Twoje konto
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Moje pomysły
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pomysły przypisane do Twojego konta mieszkańca.
          </p>
        </div>
        <Link className={uiTheme.button.primary} to="/dodaj-pomysl">
          <Plus size={17} /> Dodaj pomysł
        </Link>
      </div>

      {searchParams.get('dodano') === 'true' && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-100 p-4 text-sm font-medium text-emerald-900">
          <CheckCircle2 size={19} /> Pomysł został zapisany lokalnie.
        </div>
      )}

      {ideas.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {ideas.map((idea) => {
            const status = IDEA_STATUS_OPTIONS.find(
              (item) => item.value === idea.status,
            );
            return (
              <article
                className={`${uiTheme.surface.card} overflow-hidden`}
                key={idea.id}
              >
                {idea.img ? (
                  <img
                    alt="Ilustracja pomysłu"
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
                  </div>
                  <h2 className="mt-4 font-semibold">{idea.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {idea.desc}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 ${uiTheme.status[idea.status]}`}
                    >
                      {status?.label}
                    </span>
                    <time className="text-slate-400">
                      {new Intl.DateTimeFormat('pl-PL').format(
                        new Date(idea.created_at),
                      )}
                    </time>
                  </div>
                </div>
              </article>
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
              Nie masz jeszcze własnych pomysłów
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Dodaj pierwszy pomysł i zobacz go na tej liście.
            </p>
            <Link
              className={`${uiTheme.button.secondary} mt-5`}
              to="/dodaj-pomysl"
            >
              <Plus size={16} /> Dodaj pomysł
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
