import { CalendarDays, MessageSquare, ThumbsUp } from 'lucide-react';

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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function ReportCard({
  report,
  compact = false,
}: {
  report: Report;
  compact?: boolean;
}) {
  return (
    <article className={`${uiTheme.surface.card} p-5`}>
      <div
        className={`grid gap-5 ${compact ? 'sm:grid-cols-[1fr_180px]' : 'md:grid-cols-[1fr_210px]'}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={uiTheme.badge.info}>{report.district}</span>
            <span className={uiTheme.badge.neutral}>{report.category}</span>
          </div>
          <h3 className="mt-5 text-base leading-snug font-semibold text-slate-950">
            {report.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
            {report.description}
          </p>
        </div>
        <div>
          <span
            className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${uiTheme.status[report.status]}`}
          >
            {statusLabels[report.status]}
          </span>
          <img
            alt="Ilustracja zgłoszenia"
            className="h-28 w-full rounded-xl object-cover"
            loading="lazy"
            src={report.image}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <MessageSquare size={14} /> {report.comments} komentarzy
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays size={14} /> {formatDate(report.updatedAt)}
        </span>
        <button
          className={`${uiTheme.button.secondary} ml-auto px-3 py-2 text-xs`}
          type="button"
        >
          <ThumbsUp size={15} /> Poprzyj
          <span className="border-l border-blue-200 pl-2">
            {report.support}
          </span>
        </button>
      </div>
    </article>
  );
}

export { statusLabels };
