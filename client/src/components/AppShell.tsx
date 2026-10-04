import type { LucideIcon } from 'lucide-react';
import {
  Accessibility,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogIn,
  LogOut,
  Menu,
  Plus,
  ThumbsUp,
  UserRound,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { uiTheme } from '../styles/theme';
import { RouteAccessibility } from './RouteAccessibility';
import { SkipLink } from './SkipLink';

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: string;
};

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

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
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (profileOpen) logoutButtonRef.current?.focus();
  }, [profileOpen]);

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

  async function handleLogout() {
    await logout();
    setProfileOpen(false);
    onClose?.();
    navigate('/mieszkaniec');
  }

  return (
    <div
      className="relative"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !profileOpen) return;
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }}
    >
      <button
        aria-controls="citizen-profile-menu"
        aria-expanded={profileOpen}
        className={`${uiTheme.surface.muted} ${uiTheme.focusRing} flex w-full items-center gap-3 p-2.5 text-left transition hover:bg-blue-100`}
        onClick={() => setProfileOpen((current) => !current)}
        ref={profileButtonRef}
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
              {user.district ?? 'Brak przypisanej dzielnicy'}
            </p>
          </div>
          <button
            className={`${uiTheme.button.danger} w-full justify-start px-3 text-left text-xs`}
            onClick={handleLogout}
            ref={logoutButtonRef}
            type="button"
          >
            <LogOut size={16} /> Wyloguj się
          </button>
        </div>
      )}
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
  const navigationSections: NavigationSection[] = [
    {
      label: 'Główne',
      items: [
        { label: 'Pulpit', icon: LayoutDashboard, to: '/mieszkaniec' },
        {
          label: 'Wszystkie pomysły',
          icon: Lightbulb,
          to: '/pomysly?district=all',
        },
      ],
    },
    {
      label: 'Twoja aktywność',
      items: [
        {
          label: 'Dodaj pomysł',
          icon: Plus,
          to: '/dodaj-pomysl',
        },
        ...(user
          ? [
              {
                label: 'Moje pomysły',
                icon: FileText,
                to: '/moje-pomysly',
              },
              {
                label: 'Poparte pomysły',
                icon: ThumbsUp,
                to: '/pomysly?district=all&poparte=true',
              },
            ]
          : []),
      ],
    },
    {
      label: 'Odkrywaj',
      items: [
        {
          label: 'Najnowsze',
          icon: CalendarDays,
          to: '/pomysly?sort=najnowsze',
        },
        {
          label: 'Zrealizowane',
          icon: BadgeCheck,
          to: '/pomysly?status=completed',
        },
      ],
    },
    {
      label: 'Informacje',
      items: [
        {
          label: 'Dostępność',
          icon: Accessibility,
          to: '/dostepnosc',
        },
      ],
    },
  ];

  function isActive(to: string) {
    const [pathname, query] = to.split('?');
    if (query)
      return location.pathname === pathname && location.search === `?${query}`;
    if (to.includes('#')) {
      const [hashPathname, hash] = to.split('#');
      return location.pathname === hashPathname && location.hash === `#${hash}`;
    }
    return location.pathname === to;
  }

  return (
    <aside className="app-sidebar-panel flex h-full min-h-0 flex-col px-4 py-5">
      <div className="flex shrink-0 items-center justify-between px-1">
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

      <nav
        className="citizen-sidebar-scroll mt-8 -mr-4 min-h-0 flex-1 space-y-6 overflow-y-auto pr-4 pb-6"
        aria-label="Nawigacja panelu mieszkańca"
      >
        {navigationSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              {section.label}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map(({ label, icon: Icon, to, badge }) => {
                const active = isActive(to);
                return (
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${uiTheme.focusRing} ${
                      active
                        ? 'bg-app-primary font-semibold text-white shadow-sm shadow-blue-800/15'
                        : 'text-app-text-muted hover:bg-app-muted hover:text-app-text'
                    }`}
                    key={label}
                    onClick={onClose}
                    to={to}
                  >
                    <Icon className="shrink-0" size={17} strokeWidth={1.9} />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {badge && (
                      <span
                        className={`ml-auto min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${
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
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-100 pt-4">
        <CitizenProfile onClose={onClose} />
      </div>
    </aside>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useFocusTrap({
    active: menuOpen,
    containerRef: mobileDialogRef,
    initialFocusRef: closeButtonRef,
    returnFocusRef: menuButtonRef,
    onEscape: closeMenu,
  });

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
            tabIndex={-1}
            type="button"
          />
          <div
            className="relative h-full w-72 shadow-2xl"
            ref={mobileDialogRef}
            tabIndex={-1}
          >
            <Sidebar closeButtonRef={closeButtonRef} onClose={closeMenu} />
          </div>
        </div>
      )}

      <div className="dashboard-section min-h-screen lg:pl-64" inert={menuOpen}>
        <div className="relative z-10 px-4 pt-4 lg:hidden">
          <button
            aria-label="Otwórz menu"
            className={`${uiTheme.iconButton} ring-app-border bg-white/80 shadow-sm ring-1`}
            onClick={() => setMenuOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
