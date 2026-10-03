import type { LucideIcon } from 'lucide-react';
import {
  Accessibility,
  BadgeCheck,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { uiTheme } from '../styles/theme';
import { RouteAccessibility } from './RouteAccessibility';
import { SkipLink } from './SkipLink';

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: string;
};

const navigationCitizen: NavigationItem[] = [
  { label: 'Pulpit', icon: LayoutDashboard, to: '/mieszkaniec' },
  { label: 'Pomysły mieszkańców', icon: Lightbulb, to: '/pomysly' },
  { label: 'Ranking inicjatyw', icon: Trophy, to: '/pomysly?sort=popularne' },
  { label: 'Zrealizowane', icon: BadgeCheck, to: '/pomysly?status=completed' },
];

const navigationLoggedIn: NavigationItem[] = [
  { label: 'Moje pomysły', icon: FileText, to: '/moje-pomysly', badge: '5' },
];

function CitizenLogo() {
  return (
    <Link
      className={`flex items-center gap-3 rounded-xl ${uiTheme.focusRing}`}
      to="/mieszkaniec"
    >
      <span className="bg-app-primary grid size-10 place-items-center rounded-xl text-white shadow-sm shadow-blue-800/20">
        <img
          alt=""
          className="h-7 w-9 object-contain"
          src="/sukiennice-logo.png"
        />
      </span>
      <span className="leading-tight">
        <span className="text-app-text block font-bold">Głos Miasta</span>
        <span className="text-app-text-muted block text-[10px] font-semibold tracking-[0.2em] uppercase">
          Kraków
        </span>
      </span>
    </Link>
  );
}

function CitizenProfile({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link
        className={`${uiTheme.surface.muted} ${uiTheme.focusRing} flex items-center gap-3 p-2.5 text-left transition hover:bg-blue-100`}
        onClick={onClose}
        to="/logowanie"
      >
        <span className="bg-app-primary grid size-10 place-items-center rounded-xl text-white">
          <LogIn size={18} />
        </span>
        <span>
          <span className="block text-sm font-bold text-blue-950">
            Zaloguj się
          </span>
          <span className="mt-0.5 block text-[10px] text-blue-700">
            Konto mieszkańca
          </span>
        </span>
      </Link>
    );
  }

  const initials =
    `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  function handleLogout() {
    logout();
    setProfileOpen(false);
    onClose?.();
    navigate('/mieszkaniec');
  }

  return (
    <div className="relative">
      {profileOpen && (
        <div
          className={`${uiTheme.surface.card} absolute right-0 bottom-[calc(100%+8px)] left-0 overflow-hidden p-1.5 shadow-xl shadow-slate-900/10`}
          id="citizen-profile-menu"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="text-xs font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {user.district}
            </p>
          </div>
          <button
            className={`${uiTheme.button.ghost} mt-1 w-full justify-start px-3 text-left text-xs`}
            onClick={() => setProfileOpen(false)}
            type="button"
          >
            <Settings size={16} /> Ustawienia konta
          </button>
          <button
            className={`${uiTheme.button.danger} w-full justify-start px-3 text-left text-xs`}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={16} /> Wyloguj się
          </button>
        </div>
      )}

      <button
        aria-controls="citizen-profile-menu"
        aria-expanded={profileOpen}
        className={`${uiTheme.surface.muted} ${uiTheme.focusRing} flex w-full items-center gap-3 p-2.5 text-left transition hover:bg-blue-100`}
        onClick={() => setProfileOpen((current) => !current)}
        type="button"
      >
        <span className="bg-app-primary grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white shadow-sm shadow-blue-800/20">
          {initials}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-bold text-blue-950">
            {user.firstName} {user.lastName}
          </span>
          <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-700">
            <UserRound size={12} /> Mieszkaniec
          </span>
        </span>
        <ChevronRight
          className={`shrink-0 text-blue-500 transition-transform ${profileOpen ? '-rotate-90' : 'rotate-90'}`}
          size={17}
        />
      </button>
    </div>
  );
}

function Sidebar({
  onClose,
  closeButtonRef,
}: {
  onClose?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const navigation = user
    ? [
        ...navigationCitizen.slice(0, 2),
        ...navigationLoggedIn,
        ...navigationCitizen.slice(2),
      ]
    : navigationCitizen;

  function isActive(to: string) {
    const [pathname, query] = to.split('?');
    if (query)
      return location.pathname === pathname && location.search === `?${query}`;
    if (to === '/pomysly') {
      return (
        location.pathname.startsWith('/pomysly') &&
        location.search !== '?sort=popularne' &&
        location.search !== '?status=completed'
      );
    }
    return location.pathname === to;
  }

  return (
    <aside className="bg-app-surface flex h-full flex-col px-4 py-5">
      <div className="flex items-center justify-between px-1">
        <CitizenLogo />
        {onClose && (
          <button
            aria-label="Zamknij menu"
            className={`${uiTheme.iconButton} size-9 lg:hidden`}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <Link
        className={`${uiTheme.button.primary} mt-7 h-11 px-4 py-0`}
        onClick={onClose}
        to={user ? '/dodaj-pomysl' : '/logowanie'}
      >
        {user ? <Plus size={17} /> : <LogIn size={17} />}
        {user ? 'Dodaj pomysł' : 'Zaloguj się'}
      </Link>

      <nav className="mt-5 space-y-1" aria-label="Nawigacja mieszkańca">
        {navigation.map(({ label, icon: Icon, to, badge }) => {
          const active = isActive(to);
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${uiTheme.focusRing} ${
                active
                  ? 'bg-app-primary font-semibold text-white shadow-sm shadow-blue-800/15'
                  : 'text-app-text-muted hover:bg-app-muted hover:text-app-text'
              }`}
              key={label}
              onClick={onClose}
              to={to}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
              {badge && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <a
            className={`${uiTheme.text.link} flex items-center gap-2 px-1 text-xs`}
            href="#pomoc"
          >
            <CircleHelp size={15} /> Pomoc / Jak to działa
          </a>
          <a
            className={`${uiTheme.text.link} flex items-center gap-2 px-1 text-xs`}
            href="#standardy"
          >
            <ShieldCheck size={15} /> Karta Dialogu
          </a>
          <Link
            className={`${uiTheme.text.link} flex items-center gap-2 px-1 text-xs`}
            onClick={onClose}
            to="/dostepnosc"
          >
            <Accessibility size={15} /> Tryb dostępności
          </Link>
        </div>
        <CitizenProfile onClose={onClose} />
      </div>
    </aside>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  useEffect(() => {
    if (!menuOpen) return;
    closeButtonRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu();
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  return (
    <div className={uiTheme.layout.page}>
      <RouteAccessibility />
      <SkipLink />
      <div className="border-app-border fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:block">
        <Sidebar />
      </div>
      {menuOpen && (
        <div
          aria-label="Menu nawigacyjne"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
        >
          <button
            aria-label="Zamknij menu"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={closeMenu}
            type="button"
          />
          <div className="relative h-full w-72 shadow-2xl">
            <Sidebar closeButtonRef={closeButtonRef} onClose={closeMenu} />
          </div>
        </div>
      )}

      <div className="lg:pl-64" inert={menuOpen}>
        <div className="px-4 pt-4 lg:hidden">
          <button
            aria-label="Otwórz menu"
            className={`${uiTheme.iconButton} bg-app-surface ring-app-border shadow-sm ring-1`}
            onClick={() => setMenuOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
