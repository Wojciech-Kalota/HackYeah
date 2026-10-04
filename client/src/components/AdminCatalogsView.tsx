import { Check, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { api, getApiErrorMessage, type NamedResource } from '../api/client';
import { loadCatalog, type ApiCatalog } from '../api/reports';
import { PageMain } from './PageMain';
import { uiTheme } from '../styles/theme';

type CatalogKey = keyof ApiCatalog;

const catalogConfig: Array<{
  key: CatalogKey;
  title: string;
  description: string;
}> = [
  {
    key: 'districts',
    title: 'Dzielnice',
    description: 'Obszary dostępne w profilach i zgłoszeniach.',
  },
  {
    key: 'categories',
    title: 'Kategorie',
    description: 'Kategorie używane do klasyfikacji pomysłów.',
  },
  {
    key: 'statuses',
    title: 'Statusy',
    description:
      'Etapy obsługi pomysłu. Nazwy techniczne wpływają na prezentację statusu.',
  },
];

function catalogApi(key: CatalogKey) {
  return api[key];
}

export function AdminCatalogsView() {
  const [catalog, setCatalog] = useState<ApiCatalog>({
    categories: [],
    districts: [],
    statuses: [],
  });
  const [newNames, setNewNames] = useState<Record<CatalogKey, string>>({
    categories: '',
    districts: '',
    statuses: '',
  });
  const [editing, setEditing] = useState<{
    key: CatalogKey;
    item: NamedResource;
  }>();
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function reload() {
    setLoading(true);
    setError('');
    try {
      setCatalog(await loadCatalog());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      await reload();
      setMessage(success);
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    } finally {
      setBusy(false);
    }
  }

  function addItem(event: FormEvent, key: CatalogKey) {
    event.preventDefault();
    const name = newNames[key].trim();
    if (!name) return;
    void run(async () => {
      await catalogApi(key).create(name);
      setNewNames((current) => ({ ...current, [key]: '' }));
    }, 'Element został dodany.');
  }

  function saveEdit() {
    if (!editing || !editingName.trim()) return;
    void run(async () => {
      await catalogApi(editing.key).update(editing.item.id, editingName.trim());
      setEditing(undefined);
    }, 'Zmiany zostały zapisane.');
  }

  function deleteItem(key: CatalogKey, item: NamedResource) {
    if (!window.confirm(`Usunąć „${item.name}”?`)) return;
    void run(() => catalogApi(key).delete(item.id), 'Element został usunięty.');
  }

  return (
    <PageMain className={uiTheme.layout.content}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
            Konfiguracja
          </p>
          <h1 className={`${uiTheme.text.heading} mt-2 text-3xl md:text-4xl`}>
            Słowniki systemowe
          </h1>
          <p className={`${uiTheme.text.body} mt-2 max-w-2xl`}>
            Zarządzaj wartościami udostępnianymi przez API w formularzach i
            filtrach.
          </p>
        </div>
        <button
          className={uiTheme.button.secondary}
          disabled={loading || busy}
          onClick={() => void reload()}
          type="button"
        >
          <RefreshCw size={16} /> Odśwież
        </button>
      </div>

      {error && (
        <p className="mt-5 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-5 text-sm font-medium text-emerald-800" role="status">
          {message}
        </p>
      )}
      {loading ? (
        <p className="mt-7 text-sm text-slate-500">Ładowanie…</p>
      ) : (
        <div className="mt-7 grid gap-5 xl:grid-cols-3">
          {catalogConfig.map(({ key, title, description }) => (
            <section className={`${uiTheme.surface.card} p-5`} key={key}>
              <h2 className="text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">
                {description}
              </p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(event) => addItem(event, key)}
              >
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Nowa wartość: {title}</span>
                  <input
                    className={uiTheme.field}
                    onChange={(event) =>
                      setNewNames((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder="Dodaj wartość"
                    value={newNames[key]}
                  />
                </label>
                <button
                  aria-label={`Dodaj do: ${title}`}
                  className={`${uiTheme.button.primary} px-3`}
                  disabled={busy || !newNames[key].trim()}
                  type="submit"
                >
                  <Plus size={17} />
                </button>
              </form>
              <ul className="mt-5 divide-y divide-slate-100">
                {catalog[key].map((item) => {
                  const isEditing =
                    editing?.key === key && editing.item.id === item.id;
                  return (
                    <li
                      className="flex min-h-12 items-center gap-2 py-2"
                      key={item.id}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className={`${uiTheme.field} h-9 min-w-0 flex-1 py-1.5 text-sm`}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          value={editingName}
                        />
                      ) : (
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                          {item.name}
                        </span>
                      )}
                      {isEditing ? (
                        <>
                          <button
                            aria-label="Zapisz"
                            className={`${uiTheme.iconButton} size-8 text-emerald-700`}
                            disabled={busy}
                            onClick={saveEdit}
                            type="button"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            aria-label="Anuluj"
                            className={`${uiTheme.iconButton} size-8`}
                            onClick={() => setEditing(undefined)}
                            type="button"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            aria-label={`Edytuj ${item.name}`}
                            className={`${uiTheme.iconButton} size-8`}
                            onClick={() => {
                              setEditing({ key, item });
                              setEditingName(item.name);
                            }}
                            type="button"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            aria-label={`Usuń ${item.name}`}
                            className={`${uiTheme.iconButton} size-8 text-red-700`}
                            disabled={busy}
                            onClick={() => deleteItem(key, item)}
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageMain>
  );
}
