import { createBrowserRouter } from 'react-router-dom';

import { App } from './App';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ReportsPage } from './pages/ReportsPage';
import { StartPage } from './pages/StartPage';

export const router = createBrowserRouter([
  { path: '/', element: <StartPage /> },
  { path: '/admin', element: <AdminLoginPage /> },
  { path: '/admin/panel', element: <AdminPage /> },
  { path: '/admin/panel/projekty', element: <AdminPage view="projects" /> },
  {
    element: <App />,
    children: [
      { path: 'mieszkaniec', element: <HomePage /> },
      { path: 'zgloszenia', element: <ReportsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
