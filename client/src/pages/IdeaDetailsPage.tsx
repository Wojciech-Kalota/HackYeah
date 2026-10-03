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
import { statusLabels } from '../components/ReportCard';
import { uiTheme } from '../styles/theme';
import { exampleIdeaRelations, reports } from '../utils/dummyData';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function IdeaDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const report = reports.find((item) => item.id === Number(id));

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

  const { comments, upvotes, duplicates } = exampleIdeaRelations;
  const exampleUpvoteQuantity = upvotes.reduce(
    (sum, upvote) => sum + (upvote.quantity ?? 1),
    0,
  );

  return (
    <main className={uiTheme.layout.content}>
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-800"
        to="/pomysly"
      >
        <ArrowLeft size={16} /> Wszystkie pomysły
      </Link>

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <article className={`${uiTheme.surface.card} overflow-hidden`}>
            <img
              alt="Ilustracja pomysłu"
              className="max-h-[460px] w-full bg-slate-100 object-cover"
              src={report.image}
            />
            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className={uiTheme.badge.info}>{report.district}</span>
                <span className={uiTheme.badge.neutral}>{report.category}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${uiTheme.status[report.status]}`}
                >
                  {statusLabels[report.status]}
                </span>
              </div>
              <h1 className="mt-5 text-2xl leading-tight font-bold tracking-tight md:text-4xl">
                {report.title}
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 md:text-base">
                {report.description} Projekt zakłada wykonanie prac z
                uwzględnieniem dostępności dla osób z ograniczoną mobilnością
                oraz konsultację ostatecznego rozwiązania z mieszkańcami
                najbliższej okolicy.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-xs text-slate-500">
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
              </div>
            </div>
          </article>

          <section className={`${uiTheme.surface.card} p-5 md:p-7`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
                  Dyskusja
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Komentarze mieszkańców
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Przykładowe rekordy: {comments.length}
              </span>
            </div>

            {user ? (
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
                  state={{ from: `/pomysly/${report.id}` }}
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

          <section className={`${uiTheme.surface.card} p-5 md:p-7`}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-800">
                <Copy size={18} />
              </span>
              <div>
                <h2 className="text-xl font-bold">
                  Podobne i zduplikowane pomysły
                </h2>
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
                    <h3 className="mt-2 text-sm font-semibold">
                      {duplicate.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                      {duplicate.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-22">
          <section className={`${uiTheme.surface.card} p-5`}>
            <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
              Poparcie
            </p>
            <div className="mt-3 flex items-end gap-2">
              <strong className="text-4xl leading-none">
                {report.support}
              </strong>
              <span className="pb-1 text-sm text-slate-500">
                głosów mieszkańców
              </span>
            </div>
            <button
              className={`${uiTheme.button.primary} mt-5 w-full`}
              type="button"
            >
              <ThumbsUp size={17} /> Poprzyj ten pomysł
            </button>
          </section>

          <section className={`${uiTheme.surface.card} p-5`}>
            <h2 className="font-bold">Przykładowe głosy</h2>
            <p className="mt-1 text-xs text-slate-500">
              Suma `quantity` w pokazanej próbce: {exampleUpvoteQuantity}
            </p>
            <div className="mt-4 space-y-3">
              {upvotes.map((upvote) => (
                <div
                  className="rounded-xl bg-slate-50 p-3"
                  key={`${upvote.user_id}-${upvote.date}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold">
                      {upvote.user_id}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      +{upvote.quantity ?? 1}
                    </span>
                  </div>
                  <time className="mt-1 block text-[10px] text-slate-400">
                    {formatDate(upvote.date)}
                  </time>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
