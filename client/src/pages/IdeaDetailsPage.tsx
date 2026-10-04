import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  MapPin,
  MessageSquare,
  Pencil,
  RefreshCw,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { api, getApiErrorMessage, type ApiComment } from '../api/client';
import { loadCatalog, mapIdeaToReport } from '../api/reports';
import { useAuth } from '../auth/AuthContext';
import { PageMain } from '../components/PageMain';
import { ReportCard } from '../components/ReportCard';
import { IDEA_STATUS_OPTIONS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { IdeaStatus, Report } from '../types/domain';

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
        <div className="flex min-h-64 items-center justify-center bg-slate-50/60 sm:p-6 lg:min-h-[480px] lg:border-r lg:border-slate-100">
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
        </div>
        <h1
          className={`${uiTheme.text.heading} mt-5 text-2xl leading-tight md:text-4xl`}
        >
          {report.title}
        </h1>
        <p className="text-app-text-muted mt-5 text-sm leading-7 whitespace-pre-wrap md:text-base">
          {report.description}
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
  );
}

type CommentsProps = {
  comments: ApiComment[];
  duplicates: Report[];
  currentUserId?: string;
  isAdmin: boolean;
  reportId: string | number;
  onAdd: (text: string) => Promise<void>;
  onUpdate: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function CommentsSection({
  comments,
  duplicates,
  currentUserId,
  isAdmin,
  reportId,
  onAdd,
  onUpdate,
  onDelete,
}: CommentsProps) {
  const [tab, setTab] = useState<'comments' | 'duplicates'>('comments');
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string>();
  const [editingText, setEditingText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    } finally {
      setBusy(false);
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight' || event.key === 'End'
        ? 'duplicates'
        : 'comments';
    setTab(next);
    requestAnimationFrame(() =>
      document.getElementById(`${next}-tab`)?.focus(),
    );
  }

  return (
    <section className={`${uiTheme.surface.card} mt-6 p-5 md:p-7`}>
      <p className="text-app-primary-strong text-xs font-semibold tracking-wide uppercase">
        Dyskusja i powiązania
      </p>
      <h2 className="mt-1 text-xl font-bold">Informacje o pomyśle</h2>
      <div
        aria-label="Komentarze i duplikaty"
        className="mt-5 flex w-full gap-1 rounded-xl bg-slate-100 p-1 sm:w-fit"
        role="tablist"
      >
        {(['comments', 'duplicates'] as const).map((item) => (
          <button
            aria-controls={`${item}-panel`}
            aria-selected={tab === item}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition sm:flex-none ${
              tab === item
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id={`${item}-tab`}
            key={item}
            onClick={() => setTab(item)}
            onKeyDown={handleTabKeyDown}
            role="tab"
            tabIndex={tab === item ? 0 : -1}
            type="button"
          >
            {item === 'comments' ? (
              <MessageSquare size={15} />
            ) : (
              <Copy size={15} />
            )}
            {item === 'comments'
              ? `Komentarze (${comments.length})`
              : `Duplikaty (${duplicates.length})`}
          </button>
        ))}
      </div>

      {tab === 'duplicates' ? (
        <div
          aria-labelledby="duplicates-tab"
          id="duplicates-panel"
          role="tabpanel"
        >
          {duplicates.length > 0 ? (
            <div className="mt-6 space-y-3">
              {duplicates.map((duplicate) => (
                <ReportCard
                  key={duplicate.id}
                  report={duplicate}
                  showVotingNotice={false}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Brak powiązanych duplikatów tego pomysłu.
            </p>
          )}
        </div>
      ) : (
        <div aria-labelledby="comments-tab" id="comments-panel" role="tabpanel">
          {currentUserId ? (
            <div className="mt-5 rounded-2xl bg-slate-50/60 p-4">
              <label className="sr-only" htmlFor="new-comment">
                Treść komentarza
              </label>
              <textarea
                className={`${uiTheme.field} min-h-24 resize-y py-3`}
                id="new-comment"
                maxLength={2000}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Napisz komentarz..."
                value={draft}
              />
              <div className="mt-3 flex justify-end">
                <button
                  className={`${uiTheme.button.primary} px-4 py-2.5 text-xs`}
                  disabled={busy || !draft.trim()}
                  onClick={() =>
                    void run(async () => {
                      await onAdd(draft.trim());
                      setDraft('');
                    })
                  }
                  type="button"
                >
                  <Send size={15} /> {busy ? 'Zapisywanie…' : 'Dodaj komentarz'}
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

          {error && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 divide-y divide-slate-100">
            {!comments.length && (
              <p className="py-5 text-sm text-slate-500">
                Brak komentarzy. Rozpocznij dyskusję.
              </p>
            )}
            {comments.map((comment) => {
              const canManage = isAdmin || comment.userId === currentUserId;
              const isEditing = editingId === comment.id;
              return (
                <article
                  className="flex gap-3 py-5 first:pt-0"
                  key={comment.id}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <UserRound size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.userId === currentUserId
                          ? 'Ty'
                          : `Użytkownik ${comment.userId.slice(0, 8)}`}
                      </p>
                      {canManage && !isEditing && (
                        <div className="flex gap-1">
                          <button
                            aria-label="Edytuj komentarz"
                            className={`${uiTheme.iconButton} size-8`}
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditingText(comment.text);
                            }}
                            type="button"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            aria-label="Usuń komentarz"
                            className={`${uiTheme.iconButton} size-8 text-red-700`}
                            disabled={busy}
                            onClick={() => void run(() => onDelete(comment.id))}
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-2">
                        <textarea
                          className={`${uiTheme.field} min-h-20 resize-y py-2`}
                          onChange={(event) =>
                            setEditingText(event.target.value)
                          }
                          value={editingText}
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            className={`${uiTheme.button.primary} px-3 py-2 text-xs`}
                            disabled={busy || !editingText.trim()}
                            onClick={() =>
                              void run(async () => {
                                await onUpdate(comment.id, editingText.trim());
                                setEditingId(undefined);
                              })
                            }
                            type="button"
                          >
                            <Check size={14} /> Zapisz
                          </button>
                          <button
                            className={`${uiTheme.button.ghost} px-3 py-2 text-xs`}
                            onClick={() => setEditingId(undefined)}
                            type="button"
                          >
                            <X size={14} /> Anuluj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`${uiTheme.text.body} mt-2 whitespace-pre-wrap`}
                      >
                        {comment.text}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function IdeaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<IdeaDetails>();
  const [authorId, setAuthorId] = useState('');
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [duplicates, setDuplicates] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [idea, catalog, apiComments, apiDuplicates] = await Promise.all([
        api.ideas.get(id),
        loadCatalog(),
        api.ideas.comments.list(id),
        api.ideas.listDuplicates(id),
      ]);
      setReport(mapIdeaToReport(idea, catalog, apiComments.length));
      setAuthorId(idea.authorId);
      setComments(apiComments);
      setDuplicates(
        apiDuplicates.map((duplicate) => mapIdeaToReport(duplicate, catalog)),
      );
    } catch (loadError) {
      setReport(undefined);
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addComment(text: string) {
    if (!id) return;
    const created = await api.ideas.comments.create(id, text);
    setComments((current) => [...current, created]);
    setReport((current) =>
      current ? { ...current, comments: current.comments + 1 } : current,
    );
  }

  async function updateComment(commentId: string, text: string) {
    const updated = await api.ideas.comments.update(commentId, text);
    setComments((current) =>
      current.map((item) => (item.id === commentId ? updated : item)),
    );
  }

  async function deleteComment(commentId: string) {
    await api.ideas.comments.delete(commentId);
    setComments((current) => current.filter((item) => item.id !== commentId));
    setReport((current) =>
      current
        ? { ...current, comments: Math.max(0, current.comments - 1) }
        : current,
    );
  }

  async function deleteIdea() {
    if (!id || !window.confirm('Czy na pewno chcesz usunąć ten pomysł?'))
      return;
    setDeleting(true);
    setError('');
    try {
      await api.ideas.delete(id);
      navigate('/moje-pomysly', { replace: true });
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
      setDeleting(false);
    }
  }

  if (loading)
    return (
      <PageMain aria-busy="true" className={uiTheme.layout.content}>
        Ładowanie…
      </PageMain>
    );
  if (!report) {
    return (
      <PageMain
        className={`${uiTheme.layout.content} grid min-h-[calc(100vh-4rem)] place-items-center`}
      >
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-800">404</p>
          <h1 className={`${uiTheme.text.heading} mt-2 text-2xl`}>
            {error || 'Nie znaleziono pomysłu'}
          </h1>
          <Link
            className={`${uiTheme.button.secondary} mt-5`}
            to="/pomysly?district=all"
          >
            <ArrowLeft size={16} /> Wróć do listy
          </Link>
          {error && (
            <button
              className={`${uiTheme.button.ghost} mt-3`}
              onClick={() => void reload()}
              type="button"
            >
              <RefreshCw size={16} /> Spróbuj ponownie
            </button>
          )}
        </div>
      </PageMain>
    );
  }

  const canDelete =
    user?.id === authorId || Boolean(user?.roles.includes('ADMIN_USER'));
  return (
    <PageMain className={uiTheme.layout.content}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className={`${uiTheme.text.link} inline-flex items-center gap-2 text-sm`}
          to="/pomysly?district=all"
        >
          <ArrowLeft size={16} /> Wszystkie pomysły
        </Link>
        {canDelete && (
          <button
            className={`${uiTheme.button.danger} px-4 py-2.5 text-xs`}
            disabled={deleting}
            onClick={() => void deleteIdea()}
            type="button"
          >
            <Trash2 size={15} /> {deleting ? 'Usuwanie…' : 'Usuń pomysł'}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="mt-5">
        <MainIdeaPanel report={report} />
      </div>
      <CommentsSection
        comments={comments}
        currentUserId={user?.id}
        duplicates={duplicates}
        isAdmin={Boolean(user?.roles.includes('ADMIN_USER'))}
        onAdd={addComment}
        onDelete={deleteComment}
        onUpdate={updateComment}
        reportId={report.id}
      />
    </PageMain>
  );
}
