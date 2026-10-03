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
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { IDEA_STATUS_OPTIONS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { Comment, Duplicate, IdeaStatus } from '../types/domain';
import {
  exampleIdeaRelations,
  mockCitizenIdeas,
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
        <div className="flex min-h-64 items-center justify-center bg-slate-50 sm:p-6 lg:min-h-[480px] lg:border-r lg:border-slate-100">
          <img
            alt="Ilustracja pomysłu"
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
        </div>
        <h1 className="mt-5 text-2xl leading-tight font-bold tracking-tight md:text-4xl">
          {report.title}
        </h1>
        <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
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

function DuplicatesSection({ duplicates }: { duplicates: Duplicate[] }) {
  return (
    <section className={`${uiTheme.surface.card} mt-6 p-5 md:p-7`}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-800">
          <Copy size={18} />
        </span>
        <div>
          <h2 className="text-xl font-bold">Podobne i zduplikowane pomysły</h2>
          <p className="text-xs text-slate-500">
            Powiązania wykryte na podstawie treści zgłoszeń.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {duplicates.map((duplicate) => (
          <article
            className="overflow-hidden rounded-2xl border border-slate-200"
            key={duplicate.idea_id}
          >
            {duplicate.img && (
              <img
                alt="Ilustracja podobnego pomysłu"
                className="h-32 w-full object-cover"
                src={duplicate.img}
              />
            )}
            <div className="p-4">
              <p className="text-[10px] font-semibold tracking-wide text-orange-700 uppercase">
                ID: {duplicate.idea_id}
              </p>
              <h3 className="mt-2 text-sm font-semibold">{duplicate.title}</h3>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                {duplicate.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CommentsSection({
  comments,
  isLoggedIn,
  reportId,
}: {
  comments: Comment[];
  isLoggedIn: boolean;
  reportId: number | string;
}) {
  return (
    <section className={`${uiTheme.surface.card} mt-6 p-5 md:p-7`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-1 text-xl font-bold">Komentarze mieszkańców</h2>
        </div>
        <span className="text-xs text-slate-400">
          Przykładowe rekordy: {comments.length}
        </span>
      </div>

      {isLoggedIn ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <textarea
            className={`${uiTheme.field} min-h-24 resize-y py-3`}
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
                <time className="text-[11px] text-slate-400">
                  {formatDate(comment.date)}
                </time>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {comment.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function IdeaDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const mockId = Number(id?.replace(/^mock-/, ''));
  const knownReport = [...reports, ...mockCitizenIdeas].find(
    (item) => item.id === mockId,
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
      <main
        className={`${uiTheme.layout.content} grid min-h-[calc(100vh-4rem)] place-items-center`}
      >
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-800">404</p>
          <h1 className="mt-2 text-2xl font-bold">Nie znaleziono pomysłu</h1>
          <Link className={`${uiTheme.button.secondary} mt-5`} to="/pomysly">
            <ArrowLeft size={16} /> Wróć do listy
          </Link>
        </div>
      </main>
    );
  }

  const { comments, duplicates } = exampleIdeaRelations;

  return (
    <main className={uiTheme.layout.content}>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-800"
        to="/pomysly"
      >
        <ArrowLeft size={16} /> Wszystkie pomysły
      </Link>

      <div className="mt-5">
        <MainIdeaPanel report={report} />
      </div>

      <DuplicatesSection duplicates={duplicates} />

      <CommentsSection
        comments={comments}
        isLoggedIn={Boolean(user)}
        reportId={report.id}
      />
    </main>
  );
}
