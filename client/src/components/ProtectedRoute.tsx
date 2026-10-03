import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return (
      <Navigate replace state={{ from: location.pathname }} to="/logowanie" />
    );
  }

  return children;
}

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user?.roles.includes('ADMIN_USER')) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to="/administrator"
      />
    );
  }

  return children;
}
