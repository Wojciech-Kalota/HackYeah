import {
  ArrowLeft,
  CalendarDays,
  Copy,
  MapPin,
  MessageSquare,
  Send,
  ThumbsUp,
  UserRound,
} from 'lucide-react';
import { useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { AiScoreBadge } from '../components/AiScoreBadge';
import { PageMain } from '../components/PageMain';
import { IDEA_STATUS_OPTIONS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { Comment, Duplicate, IdeaStatus } from '../types/domain';
import {
  exampleIdeaRelations,
  citizenIdeas,
  reports,
  type Report,
} from '../utils/dummyData';
import { getLocalIdeas } from '../utils/localIdeas';

type IdeaDetails = Omit<Report, 'id' | 'status'> & {
  id: number | string;
  status: IdeaStatus;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function MainIdeaPanel({ report }: { report: IdeaDetails }) {
  return (
    <article
      className={`${uiTheme.surface.card} overflow-hidden ${
        report.image
          ? 'lg:grid lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]'
          : ''
      }`}
    >
      {report.image && (
        <div className="flex min-h-64 items-center justify-center bg-slate-50/60 backdrop-blur-sm sm:p-6 lg:min-h-[480px] lg:border-r lg:border-slate-100">
          <img
            alt={`Zdjęcie do pomysłu: ${report.title}`}
            className="h-auto max-h-[520px] w-full rounded-xl object-contain"
            src={report.image}
          />
        </div>
      )}
      <div className="flex flex-col justify-center p-5 md:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <span className={uiTheme.badge.info}>{report.district}</span>
          <span className={uiTheme.badge.neutral}>{report.category}</span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${uiTheme.status[report.status]}`}
          >
            {IDEA_STATUS_OPTIONS.find(
              (status) => status.value === report.status,
            )?.label ?? report.status}
          </span>
          <AiScoreBadge title={report.title} />
        </div>
        <h1
          className={`${uiTheme.text.heading} mt-5 text-2xl leading-tight md:text-4xl`}
        >
          {report.title}
        </h1>
        <p className="text-app-text-muted mt-5 text-sm leading-7 md:text-base">
          {report.description} Projekt zakłada wykonanie prac z uwzględnieniem
          dostępności dla osób z ograniczoną mobilnością oraz konsultację
          ostatecznego rozwiązania z mieszkańcami najbliższej okolicy.
        </p>
        <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <MapPin size={15} /> {report.district}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={15} /> Aktualizacja:{' '}
              {formatDate(report.updatedAt)}
            </span>
            <span className="flex items-center gap-2">
              <MessageSquare size={15} /> {report.comments} komentarzy
            </span>
            <span className="flex items-center gap-2 font-semibold text-blue-800">
              <ThumbsUp size={15} /> {report.support} głosów
            </span>
          </div>
          <button
            className={`${uiTheme.button.primary} shrink-0 px-4 py-2.5 text-xs`}
            type="button"
          >
            <ThumbsUp size={15} /> Poprzyj pomysł
          </button>
        </div>
      </div>
    </article>
  );
}

function DuplicatesList({ duplicates }: { duplicates: Duplicate[] }) {
  return (
    <div className="mt-6 divide-y divide-slate-100">
      <div className="mb-2 rounded-xl bg-orange-50 p-4 text-xs leading-5 text-orange-900">
        Te zgłoszenia zostały oznaczone jako potencjalnie podobne. Są materiałem
        pomocniczym, a nie odnośnikami do osobnych pomysłów.
      </div>
      <div className="divide-y divide-slate-100">
        {duplicates.map((duplicate) => (
          <article
            className="flex flex-col gap-4 py-5 sm:flex-row"
            key={duplicate.idea_id}
          >
            {duplicate.img && (
              <img
                alt={`Zdjęcie podobnego pomysłu: ${duplicate.title}`}
                className="h-28 w-full shrink-0 rounded-xl object-cover sm:w-36"
                src={duplicate.img}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-semibold text-orange-800">
                  <Copy size={12} /> Potencjalny duplikat
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-800">
                {duplicate.title}
              </h3>
              <p className={`${uiTheme.text.body} mt-2`}>{duplicate.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CommentsSection({
  comments,
  duplicates,
  isLoggedIn,
  reportId,
}: {
  comments: Comment[];
  duplicates: Duplicate[];
  isLoggedIn: boolean;
  reportId: number | string;
}) {
  const [activeTab, setActiveTab] = useState<'comments' | 'duplicates'>(
    'comments',
  );

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextTab =
      event.key === 'ArrowRight' || event.key === 'End'
        ? 'duplicates'
        : 'comments';
    setActiveTab(nextTab);
    requestAnimationFrame(() =>
      document.getElementById(`${nextTab}-tab`)?.focus(),
    );
  }

  return (
    <section className={`${uiTheme.surface.card} mt-6 p-5 md:p-7`}>
      <div>
        <p className="text-app-primary-strong text-xs font-semibold tracking-wide uppercase">
          Dyskusja i powiązania
        </p>
        <h2 className="mt-1 text-xl font-bold">Informacje o pomyśle</h2>
      </div>

      <div
        aria-label="Komentarze i duplikaty"
        className="mt-5 flex w-full gap-1 rounded-xl bg-slate-100 p-1 sm:w-fit"
        role="tablist"
      >
        <button
          aria-controls="comments-panel"
          aria-selected={activeTab === 'comments'}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition sm:flex-none ${
            activeTab === 'comments'
              ? 'bg-white text-blue-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="comments-tab"
          onClick={() => setActiveTab('comments')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          type="button"
        >
          <MessageSquare size={15} /> Komentarze ({comments.length})
        </button>
        <button
          aria-controls="duplicates-panel"
          aria-selected={activeTab === 'duplicates'}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition sm:flex-none ${
            activeTab === 'duplicates'
              ? 'bg-white text-orange-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="duplicates-tab"
          onClick={() => setActiveTab('duplicates')}
          onKeyDown={handleTabKeyDown}
          role="tab"
          type="button"
        >
          <Copy size={15} /> Duplikaty ({duplicates.length})
        </button>
      </div>

      {activeTab === 'comments' ? (
        <div
          aria-labelledby="comments-tab"
          id="comments-panel"
          role="tabpanel"
          tabIndex={0}
        >
          {isLoggedIn ? (
            <div className="mt-5 rounded-2xl bg-slate-50/60 p-4 backdrop-blur-sm">
              <label className="sr-only" htmlFor="new-comment">
                Treść komentarza
              </label>
              <textarea
                className={`${uiTheme.field} min-h-24 resize-y py-3`}
                id="new-comment"
                placeholder="Napisz komentarz..."
              />
              <div className="mt-3 flex justify-end">
                <button
                  className={`${uiTheme.button.primary} px-4 py-2.5 text-xs`}
                  type="button"
                >
                  <Send size={15} /> Dodaj komentarz
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
              <Link
                className="font-semibold underline"
                state={{ from: `/pomysly/${reportId}` }}
                to="/logowanie"
              >
                Zaloguj się
              </Link>{' '}
              aby dołączyć do dyskusji.
            </div>
          )}

          <div className="mt-6 divide-y divide-slate-100">
            {comments.map((comment) => (
              <article
                className="flex gap-3 py-5 first:pt-0"
                key={`${comment.user_id}-${comment.date}`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <UserRound size={18} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {comment.user_id}
                    </p>
                    <time className="text-app-text-subtle text-[11px]">
                      {formatDate(comment.date)}
                    </time>
                  </div>
                  <p className={`${uiTheme.text.body} mt-2`}>{comment.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div
          aria-labelledby="duplicates-tab"
          id="duplicates-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <DuplicatesList duplicates={duplicates} />
        </div>
      )}
    </section>
  );
}

export function IdeaDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const accountIdeaId = Number(id?.replace(/^account-/, ''));
  const knownReport = [...reports, ...citizenIdeas].find(
    (item) => item.id === accountIdeaId,
  );
  const localIdea = getLocalIdeas(user?.id).find((item) => item.id === id);
  const report: IdeaDetails | undefined =
    knownReport ??
    (localIdea && {
      id: localIdea.id,
      district: localIdea.district,
      category: localIdea.category,
      title: localIdea.title,
      description: localIdea.desc,
      status: localIdea.status,
      comments: 0,
      support: 0,
      updatedAt: localIdea.created_at,
      image: localIdea.img ?? '',
    });

  if (!report) {
    return (
      <PageMain
        className={`${uiTheme.layout.content} grid min-h-[calc(100vh-4rem)] place-items-center`}
      >
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-800">404</p>
          <h1 className={`${uiTheme.text.heading} mt-2 text-2xl`}>
            Nie znaleziono pomysłu
          </h1>
          <Link className={`${uiTheme.button.secondary} mt-5`} to="/pomysly">
            <ArrowLeft size={16} /> Wróć do listy
          </Link>
        </div>
      </PageMain>
    );
  }

  const { comments, duplicates } = exampleIdeaRelations;

  return (
    <PageMain className={uiTheme.layout.content}>
      <Link
        className={`${uiTheme.text.link} inline-flex items-center gap-2 text-sm`}
        to="/pomysly"
      >
        <ArrowLeft size={16} /> Wszystkie pomysły
      </Link>

      <div className="mt-5">
        <MainIdeaPanel report={report} />
      </div>

      <CommentsSection
        comments={comments}
        duplicates={duplicates}
        isLoggedIn={Boolean(user)}
        reportId={report.id}
      />
    </PageMain>
  );
}
