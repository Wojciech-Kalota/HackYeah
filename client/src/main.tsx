import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import { PanoramaLayer } from './components/PanoramaLayer';
import './index.css';
import { router } from './router';

const savedTheme =
  localStorage.getItem('e-inicjatywa:theme') ??
  localStorage.getItem('glos-miasta:theme');

if (savedTheme === 'contrast') {
  localStorage.setItem('e-inicjatywa:theme', savedTheme);
  localStorage.removeItem('glos-miasta:theme');
  document.documentElement.dataset.theme = 'contrast';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="global-app-background">
      <PanoramaLayer />
      <div className="global-app-content">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </div>
    </div>
  </StrictMode>,
);
