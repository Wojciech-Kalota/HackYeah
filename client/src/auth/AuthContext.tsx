import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, type ApiUser, type Role } from '../api/client';

export type CitizenUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  district: string;
  roles: Role[];
};

type AuthContextValue = {
  user: CitizenUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<CitizenUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<CitizenUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: ApiUser): CitizenUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.nameFirst,
    lastName: user.nameLast,
    district: 'Wszystkie dzielnice',
    roles: user.roles,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const currentUser = mapUser(await api.me());
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        await api.login(email, password);
        const currentUser = mapUser(await api.me());
        setUser(currentUser);
        return currentUser;
      },
      logout: async () => {
        try {
          await api.logout();
        } finally {
          setUser(null);
        }
      },
      refresh,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth musi być użyte wewnątrz AuthProvider.');
  return context;
}
