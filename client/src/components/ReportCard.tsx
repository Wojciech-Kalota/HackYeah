import {
  CalendarDays,
  ChevronRight,
  MapPin,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { uiTheme } from '../styles/theme';
import type { Report, ReportStatus } from '../utils/dummyData';

const statusLabels: Record<ReportStatus, string> = {
  submitted: 'Nowe zgłoszenie',
  under_review: 'Analizowane przez miasto',
  accepted: 'Przyjęte do realizacji',
  in_progress: 'W realizacji',
  completed: 'Zrealizowane',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function ReportCard({ report }: { report: Report }) {
  return (
    <article
      className={`${uiTheme.surface.card} group overflow-hidden transition hover:border-blue-200`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center md:p-5">
        <Link className="shrink-0" to={`/pomysly/${report.id}`}>
          <img
            alt={`Zdjęcie do pomysłu: ${report.title}`}
            className="h-36 w-full rounded-xl object-cover transition group-hover:opacity-90 sm:size-24"
            loading="lazy"
            src={report.image}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-blue-700">
              BO-{String(report.id).padStart(3, '0')}
            </span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] font-medium text-slate-500">
              {report.category}
            </span>
          </div>
          <Link
            className="mt-2 block text-base leading-snug font-semibold text-slate-950 hover:text-blue-800"
            to={`/pomysly/${report.id}`}
          >
            {report.title}
          </Link>
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
            <button
              className={`${uiTheme.button.secondary} rounded-lg px-3 py-2 text-xs`}
              type="button"
            >
              <ThumbsUp size={14} /> {report.support}
            </button>
            <Link
              aria-label={`Otwórz pomysł ${report.title}`}
              className={`${uiTheme.iconButton} size-9`}
              to={`/pomysly/${report.id}`}
            >
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export { statusLabels };
