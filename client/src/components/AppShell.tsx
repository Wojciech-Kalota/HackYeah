import {
  Accessibility,
  BadgeCheck,
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { uiTheme } from '../styles/theme';

const navigationCitizen = [
  { label: 'Strona główna', icon: LayoutDashboard, to: '/mieszkaniec' },
  { label: 'Pomysły mieszkańców', icon: Lightbulb, to: '/pomysly' },
  {
    label: 'Ranking inicjatyw',
    icon: Trophy,
    to: '/pomysly?sort=popularne',
  },
  {
    label: 'Zrealizowane',
    icon: BadgeCheck,
    to: '/pomysly?status=completed',
  },
] as const;

const navigationLoggedIn = [
  { label: 'Moje pomysły', icon: FileText, to: '/moje-pomysly' },
] as const;

function Logo() {
  return (
    <NavLink className="flex items-center gap-3" to="/mieszkaniec">
      <div className="grid size-9 place-items-center rounded-xl bg-blue-700 text-white shadow-sm">
        <Building2 size={19} strokeWidth={2.2} />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-blue-950">Głos Miasta</p>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Kraków
        </p>
      </div>
    </NavLink>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const navigation = user
    ? [
        ...navigationCitizen.slice(0, 2),
        ...navigationLoggedIn,
        ...navigationCitizen.slice(2),
      ]
    : navigationCitizen;

  return (
    <aside className="flex h-full flex-col bg-white px-5 py-5">
      <div className="flex items-center justify-between">
        <Logo />
        {onClose && (
          <button
            aria-label="Zamknij menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <NavLink
        className={`${uiTheme.button.primary} mt-7 h-11 px-4 py-0`}
        onClick={onClose}
        to={user ? '/dodaj-pomysl' : '/logowanie'}
      >
        {user ? <Plus size={17} /> : <LogIn size={17} />}
        {user ? 'Dodaj pomysł' : 'Zaloguj się'}
      </NavLink>

      <nav className="mt-6 space-y-1" aria-label="Główna nawigacja">
        {navigation.map(({ label, icon: Icon, to }) => (
          <NavLink
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                isActive &&
                (to === '/mieszkaniec' ||
                  to === '/pomysly' ||
                  to === '/moje-pomysly')
                  ? 'bg-blue-50 font-semibold text-blue-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
            end={to === '/mieszkaniec'}
            key={label}
            onClick={onClose}
            to={to}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-5 text-xs text-slate-600">
        <a
          className="flex items-center gap-2 hover:text-blue-800"
          href="#pomoc"
        >
          <CircleHelp size={15} /> Pomoc / Jak to działa
        </a>
        <a
          className="flex items-center gap-2 hover:text-blue-800"
          href="#standardy"
        >
          <ShieldCheck size={15} /> Karta Dialogu
        </a>
        <a
          className="flex items-center gap-2 hover:text-blue-800"
          href="#dostepnosc"
        >
          <Accessibility size={15} /> Tryb dostępności
        </a>
      </div>
    </aside>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link
        className={`${uiTheme.button.secondary} shrink-0 px-3 py-2 text-xs`}
        to="/logowanie"
      >
        <LogIn size={15} />{' '}
        <span className="hidden sm:inline">Zaloguj się</span>
      </Link>
    );
  }

  const initials =
    `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/mieszkaniec');
  }

  return (
    <div className="relative border-l border-slate-200 pl-3">
      <button
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-50"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden leading-tight md:block">
          <span className="block text-sm font-semibold">
            {user.firstName} {user.lastName}
          </span>
          <span className="block max-w-40 truncate text-[11px] text-slate-500">
            Mieszkaniec · {user.district}
          </span>
        </span>
        <ChevronDown className="hidden text-slate-400 md:block" size={15} />
      </button>

      {open && (
        <div className="absolute top-13 right-0 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2 md:hidden">
            <p className="text-sm font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {user.district}
            </p>
          </div>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={16} /> Wyloguj się
          </button>
        </div>
      )}
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:gap-4 md:px-7">
      <button
        aria-label="Otwórz menu"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        onClick={onOpenMenu}
        type="button"
      >
        <Menu size={21} />
      </button>
      <div className="relative max-w-xl flex-1">
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          size={17}
        />
        <input
          aria-label="Szukaj w serwisie"
          className="h-10 w-full rounded-xl bg-slate-100 pr-4 pl-10 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-700/20"
          placeholder="Szukaj inicjatyw..."
          type="search"
        />
      </div>
      <button
        className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-medium text-blue-950 xl:flex"
        type="button"
      >
        <MapPin className="text-emerald-600" size={15} /> Kraków · Wszystkie
        dzielnice
      </button>
      <button
        aria-label="Powiadomienia"
        className="relative hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:block"
        type="button"
      >
        <Bell size={19} />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>
      <ProfileMenu />
    </header>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={uiTheme.layout.page}>
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 lg:block">
        <Sidebar />
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Zamknij menu"
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div className="relative h-full w-72 shadow-2xl">
            <Sidebar onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}
