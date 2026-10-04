import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { PageMain } from '../components/PageMain';
import { RouteAccessibility } from '../components/RouteAccessibility';
import { uiTheme } from '../styles/theme';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate replace to="/mieszkaniec" />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register(form);
      navigate('/mieszkaniec', { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <RouteAccessibility />
      <PageMain
        className={`${uiTheme.layout.page} grid min-h-dvh place-items-center px-4 py-8`}
      >
        <section
          className={`${uiTheme.surface.card} w-full max-w-xl p-6 md:p-8`}
        >
          <Link
            className={`${uiTheme.text.link} inline-flex items-center gap-2 text-sm`}
            to="/logowanie"
          >
            <ArrowLeft size={16} /> Wróć do logowania
          </Link>
          <span className="mt-7 grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
            <UserPlus size={22} />
          </span>
          <h1 className={`${uiTheme.text.heading} mt-4 text-3xl`}>
            Załóż konto mieszkańca
          </h1>
          <p className={`${uiTheme.text.body} mt-2`}>
            Konto pozwoli dodawać pomysły, komentować i śledzić własne
            zgłoszenia.
          </p>

          <form
            className="mt-7 grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <label className={uiTheme.text.label}>
              Imię
              <input
                autoComplete="given-name"
                className={`${uiTheme.field} mt-2`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                required
                value={form.firstName}
              />
            </label>
            <label className={uiTheme.text.label}>
              Nazwisko
              <input
                autoComplete="family-name"
                className={`${uiTheme.field} mt-2`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                required
                value={form.lastName}
              />
            </label>
            <label className={`${uiTheme.text.label} sm:col-span-2`}>
              Adres e-mail
              <input
                autoComplete="email"
                className={`${uiTheme.field} mt-2`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className={`${uiTheme.text.label} sm:col-span-2`}>
              Hasło
              <input
                autoComplete="new-password"
                className={`${uiTheme.field} mt-2`}
                minLength={8}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
                type="password"
                value={form.password}
              />
              <span className="text-app-text-subtle mt-1 block text-xs">
                Minimum 8 znaków.
              </span>
            </label>
            {error && (
              <p
                className="text-sm font-medium text-red-700 sm:col-span-2"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className={`${uiTheme.button.primary} mt-2 h-12 sm:col-span-2`}
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Tworzenie konta…' : 'Utwórz konto'}
              <ArrowRight size={17} />
            </button>
          </form>
        </section>
      </PageMain>
    </>
  );
}
