import { uiTheme } from '../styles/theme';

export function SkipLink({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      className={`${uiTheme.focusRing} bg-app-surface text-app-primary-strong ring-app-border fixed top-3 left-3 z-[100] -translate-y-24 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ring-1 transition-transform focus:translate-y-0`}
      href={`#${targetId}`}
    >
      Przejdź do głównej treści
    </a>
  );
}
