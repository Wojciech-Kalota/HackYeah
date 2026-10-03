import { Link } from 'react-router-dom';

import { PageMain } from '../components/PageMain';
import { RouteAccessibility } from '../components/RouteAccessibility';
import { uiTheme } from '../styles/theme';

export function NotFoundPage() {
  return (
    <>
      <RouteAccessibility />
      <PageMain
        className={`${uiTheme.layout.page} grid place-items-center p-6 text-center`}
      >
        <div>
          <p className="text-sm font-semibold">404</p>
          <h1 className={`${uiTheme.text.heading} mt-2 text-2xl`}>
            Nie znaleziono strony
          </h1>
          <Link className={`${uiTheme.text.link} mt-4 inline-block`} to="/">
            Wróć na stronę główną
          </Link>
        </div>
      </PageMain>
    </>
  );
}
