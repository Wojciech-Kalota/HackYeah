import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const appName = 'E-Inicjatywa Kraków';

function getPageName(pathname: string) {
  if (pathname === '/') return 'Wybór panelu';
  if (pathname === '/mieszkaniec') return 'Pulpit mieszkańca';
  if (pathname === '/pomysly') return 'Pomysły mieszkańców';
  if (pathname.startsWith('/pomysly/')) return 'Szczegóły pomysłu';
  if (pathname === '/dodaj-pomysl') return 'Dodaj pomysł';
  if (pathname === '/moje-pomysly') return 'Moje pomysły';
  if (pathname === '/logowanie') return 'Logowanie mieszkańca';
  if (pathname === '/administrator') return 'Logowanie urzędnika';
  if (pathname === '/administrator/projekty')
    return 'Projekty — panel urzędnika';
  if (pathname === '/administrator/panel') return 'Pulpit urzędnika';
  if (pathname === '/dostepnosc') return 'Deklaracja dostępności';
  return 'Nie znaleziono strony';
}

export function RouteAccessibility() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState('');
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const pageName = getPageName(pathname);
    document.title = `${pageName} | ${appName}`;
    setAnnouncement(`Załadowano stronę: ${pageName}`);
    if (previousPathname.current !== pathname) {
      requestAnimationFrame(() =>
        document.getElementById('main-content')?.focus({ preventScroll: true }),
      );
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <p aria-atomic="true" aria-live="polite" className="sr-only">
      {announcement}
    </p>
  );
}
