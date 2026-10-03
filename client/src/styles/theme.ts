export const uiTheme = Object.freeze({
  layout: {
    page: 'min-h-screen bg-[#f6f8ff] text-slate-950',
    content: 'mx-auto max-w-[1440px] px-4 py-5 md:px-7 md:py-7',
  },
  surface: {
    card: 'rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40',
    muted: 'rounded-2xl bg-blue-50 ring-1 ring-blue-100',
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-800/20 transition hover:bg-blue-900',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200',
  },
  field:
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-700/10',
  badge: {
    info: 'rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800',
    neutral: 'rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600',
  },
  status: {
    submitted: 'bg-slate-100 text-slate-700',
    under_review: 'bg-orange-100 text-orange-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
  },
});

export type UiTheme = typeof uiTheme;
