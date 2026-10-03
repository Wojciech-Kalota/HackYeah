import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CitizenUser = {
  id: string;
  firstName: string;
  lastName: string;
  district: string;
};

export type LoginData = Omit<CitizenUser, 'id'> & { password: string };

type AuthContextValue = {
  user: CitizenUser | null;
  login: (data: LoginData) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = 'glos-miasta:citizen';
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): CitizenUser | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CitizenUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CitizenUser | null>(readStoredUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: ({ password: _password, ...data }) => {
        const accountKey = `${data.firstName}-${data.lastName}-${data.district}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const citizen = { ...data, id: `citizen-${accountKey}` };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(citizen));
        setUser(citizen);
      },
      logout: () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth musi być użyte wewnątrz AuthProvider.');
  return context;
}
