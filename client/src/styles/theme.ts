const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus';
const buttonBase = `inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const uiTheme = Object.freeze({
  layout: {
    page: 'min-h-screen text-app-text',
    content: 'mx-auto max-w-[1440px] px-4 py-5 md:px-7 md:py-7',
  },
  surface: {
    card: 'app-card-surface rounded-2xl border',
    muted: 'rounded-2xl bg-blue-50/70 ring-1 ring-app-primary-border',
    inset: 'rounded-xl bg-slate-100/60',
  },
  text: {
    heading: 'font-bold tracking-tight text-app-text',
    sectionHeading: 'font-bold text-app-text',
    body: 'text-sm leading-6 text-app-text-muted',
    muted: 'text-sm text-app-text-muted',
    subtle: 'text-xs text-app-text-subtle',
    label: 'text-sm font-medium text-app-text-muted',
    eyebrow:
      'flex items-center gap-2 text-xs font-semibold text-app-primary-strong',
    link: `font-semibold text-app-primary-strong transition-colors hover:text-app-primary-hover ${focusRing}`,
  },
  button: {
    primary: `${buttonBase} bg-app-primary px-5 py-3 text-white shadow-lg shadow-blue-800/20 hover:bg-app-primary-hover`,
    secondary: `${buttonBase} bg-app-primary-soft px-4 py-2.5 text-app-primary-strong ring-1 ring-app-primary-border hover:bg-blue-100`,
    accent: `${buttonBase} bg-app-accent px-5 py-3 text-app-text hover:bg-app-accent-hover`,
    ghost: `${buttonBase} px-4 py-2.5 text-app-text-muted hover:bg-app-muted hover:text-app-text`,
    danger: `${buttonBase} px-4 py-2.5 text-red-700 hover:bg-red-50`,
  },
  field: `h-11 w-full rounded-xl border border-app-border bg-white/80 px-3 text-sm text-app-text outline-none transition-colors placeholder:text-app-text-subtle hover:border-slate-300 focus:border-app-primary focus:ring-2 focus:ring-app-focus/20 ${focusRing}`,
  iconButton: `inline-flex size-10 items-center justify-center rounded-xl text-app-text-muted transition-colors hover:bg-app-muted hover:text-app-primary-strong ${focusRing}`,
  focusRing,
  badge: {
    info: 'rounded-md bg-app-primary-soft px-2 py-1 text-[10px] font-semibold text-app-primary-strong',
    neutral:
      'rounded-md bg-app-muted px-2 py-1 text-[10px] font-medium text-app-text-muted',
  },
  status: {
    submitted: 'bg-app-status-neutral-bg text-app-status-neutral-text',
    under_review: 'bg-app-status-warning-bg text-app-status-warning-text',
    accepted: 'bg-app-status-success-bg text-app-status-success-text',
    in_progress: 'bg-app-status-progress-bg text-app-status-progress-text',
    completed: 'bg-app-status-success-bg text-app-status-success-text',
    rejected: 'bg-app-status-danger-bg text-app-status-danger-text',
  },
});

export type UiTheme = typeof uiTheme;
