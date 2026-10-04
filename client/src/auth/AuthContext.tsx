import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  api,
  AUTH_UNAUTHORIZED_EVENT,
  type ApiUser,
  type Role,
} from '../api/client';

export type CitizenUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  district: string | null;
  roles: Role[];
};

type AuthContextValue = {
  user: CitizenUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<CitizenUser>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<CitizenUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<CitizenUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export class RegistrationCompletedError extends Error {
  constructor(public readonly email: string) {
    super(
      'Konto zostało utworzone, ale automatyczne logowanie nie powiodło się.',
    );
  }
}

function mapUser(user: ApiUser): CitizenUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.nameFirst,
    lastName: user.nameLast,
    district: user.districtName,
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
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    void refresh().finally(() => setLoading(false));

    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
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
      register: async ({ email, password, firstName, lastName }) => {
        const normalizedEmail = email.trim().toLocaleLowerCase('pl');
        await api.register({
          email: normalizedEmail,
          password,
          nameFirst: firstName.trim(),
          nameLast: lastName.trim(),
          roles: ['NORMAL_USER'],
        });
        try {
          await api.login(normalizedEmail, password);
          const currentUser = mapUser(await api.me());
          setUser(currentUser);
          return currentUser;
        } catch {
          throw new RegistrationCompletedError(normalizedEmail);
        }
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
