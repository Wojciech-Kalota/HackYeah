import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AddIdeaPage } from './pages/AddIdeaPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { IdeaDetailsPage } from './pages/IdeaDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { MyIdeasPage } from './pages/MyIdeasPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ReportsPage } from './pages/ReportsPage';
import { StartPage } from './pages/StartPage';

export const router = createBrowserRouter([
  { path: '/', element: <StartPage /> },
  { path: '/administrator', element: <AdminLoginPage /> },
  { path: '/administrator/panel', element: <AdminPage /> },
  {
    path: '/administrator/projekty',
    element: <AdminPage view="projects" />,
  },
  { path: '/admin', element: <Navigate replace to="/administrator" /> },
  {
    path: '/admin/panel',
    element: <Navigate replace to="/administrator/panel" />,
  },
  {
    path: '/admin/panel/projekty',
    element: <Navigate replace to="/administrator/projekty" />,
  },
  {
    element: <App />,
    children: [
      { path: 'mieszkaniec', element: <HomePage /> },
      { path: 'pomysly', element: <ReportsPage /> },
      { path: 'pomysly/:id', element: <IdeaDetailsPage /> },
      { path: 'logowanie', element: <LoginPage /> },
      {
        path: 'dodaj-pomysl',
        element: (
          <ProtectedRoute>
            <AddIdeaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'moje-pomysly',
        element: (
          <ProtectedRoute>
            <MyIdeasPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
