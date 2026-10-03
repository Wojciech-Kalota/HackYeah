import { createBrowserRouter } from 'react-router-dom';

import { App } from './App';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ReportsPage } from './pages/ReportsPage';
import { StartPage } from './pages/StartPage';

export const router = createBrowserRouter([
  { path: '/', element: <StartPage /> },
  { path: '/admin', element: <AdminPage /> },
  {
    element: <App />,
    children: [
      { path: 'mieszkaniec', element: <HomePage /> },
      { path: 'zgloszenia', element: <ReportsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
