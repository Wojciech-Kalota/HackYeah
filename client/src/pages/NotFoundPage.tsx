import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-sm font-semibold">404</p>
        <h1 className="mt-2 text-2xl font-bold">Nie znaleziono strony</h1>
        <Link className="mt-4 inline-block underline" to="/">
          Wróć na stronę główną
        </Link>
      </div>
    </main>
  );
}
