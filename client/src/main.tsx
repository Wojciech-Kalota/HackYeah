import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import './index.css';
import { router } from './router';

if (localStorage.getItem('glos-miasta:theme') === 'contrast') {
  document.documentElement.dataset.theme = 'contrast';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
