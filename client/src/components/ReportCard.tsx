import {
  CalendarDays,
  ChevronRight,
  MapPin,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { uiTheme } from '../styles/theme';
import type { Report, ReportStatus } from '../types/domain';

const statusLabels: Record<ReportStatus, string> = {
  submitted: 'Nowe zgłoszenie',
  under_review: 'Analizowane przez miasto',
  accepted: 'Przyjęte do realizacji',
  in_progress: 'W realizacji',
  completed: 'Zrealizowane',
  rejected: 'Odrzucone',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function ReportCard({
  report,
  detailsHref = `/pomysly/${report.id}`,
  nested = false,
  showProjectId = false,
  showVotingNotice = true,
}: {
  report: Report;
  detailsHref?: string;
  nested?: boolean;
  showProjectId?: boolean;
  showVotingNotice?: boolean;
}) {
  return (
    <article
      className={`${uiTheme.surface.card} group relative overflow-hidden transition hover:border-blue-200`}
      style={nested ? { backgroundColor: 'transparent' } : undefined}
    >
      <Link
        aria-label={`Otwórz pomysł ${report.title}`}
        className={`${uiTheme.focusRing} absolute inset-0 z-10 rounded-2xl`}
        to={detailsHref}
      />
      <div className="pointer-events-none relative z-20 flex flex-col gap-4 p-4 sm:flex-row sm:items-center md:p-5">
        {report.image ? (
          <img
            alt={`Zdjęcie do pomysłu: ${report.title}`}
            className="h-36 w-full shrink-0 rounded-xl object-cover transition group-hover:opacity-90 sm:size-24"
            loading="lazy"
            src={report.image}
          />
        ) : (
          <span className="grid h-36 w-full shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400 sm:size-24">
            <ImageIcon aria-hidden="true" size={24} />
            <span className="sr-only">Brak zdjęcia</span>
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showProjectId && (
              <>
                <span className="text-[10px] font-bold text-blue-700">
                  BO-{String(report.id).padStart(3, '0')}
                </span>
                <span className="text-[10px] text-slate-300">•</span>
              </>
            )}
            <span className="text-[10px] font-medium text-slate-500">
              {report.category}
            </span>
          </div>
          <h2 className="mt-2 text-base leading-snug font-semibold text-slate-950 transition-colors group-hover:text-blue-800">
            {report.title}
          </h2>
          <p className="text-app-text-muted mt-1 line-clamp-2 text-xs leading-5">
            {report.description}
          </p>
          <div className="text-app-text-subtle mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {report.district}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} /> {formatDate(report.updatedAt)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {report.comments} komentarzy
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${uiTheme.status[report.status]}`}
          >
            {statusLabels[report.status]}
          </span>
          <div className="flex items-center gap-2">
            {showVotingNotice && (
              <span className="text-app-text-subtle text-[10px] font-medium">
                Głosowanie wkrótce
              </span>
            )}
            <span className="text-app-text-muted grid size-9 place-items-center">
              <ChevronRight size={18} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export { statusLabels };
