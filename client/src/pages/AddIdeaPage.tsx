import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileImage,
  ImagePlus,
  MapPin,
  Send,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { api, getApiErrorMessage } from '../api/client';
import {
  analyzeRagSubmission,
  clearPendingRagSubmission,
  createRagSubmission,
  getRagErrorMessage,
  isSameRagPayload,
  loadPendingRagSubmission,
  RagApiError,
  savePendingRagSubmission,
  type RagSubmission,
} from '../api/rag';
import { loadCatalog, type ApiCatalog } from '../api/reports';
import { useAuth } from '../auth/AuthContext';
import { PageMain } from '../components/PageMain';
import { IDEA_CATEGORIES } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { Idea } from '../types/domain';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const descriptionSuggestions = [
  'Brakuje bezpiecznego przejścia dla pieszych',
  'W okolicy jest za mało zieleni',
  'To skrzyżowanie jest niebezpieczne',
];

const categoryKeywords: Array<{
  category: (typeof IDEA_CATEGORIES)[number];
  keywords: string[];
}> = [
  {
    category: 'Bezpieczeństwo',
    keywords: ['bezpiecz', 'niebezpiecz', 'monitoring', 'oświetl'],
  },
  {
    category: 'Czystość i odpady',
    keywords: ['śmie', 'odpad', 'kosz', 'segregac', 'czysto'],
  },
  {
    category: 'Infrastruktura drogowa',
    keywords: ['ulic', 'droga', 'chodnik', 'przejści', 'skrzyżowan'],
  },
  {
    category: 'Infrastruktura rowerowa',
    keywords: ['rower', 'ścieżk', 'droga rowerowa'],
  },
  {
    category: 'Tereny zielone',
    keywords: ['ziele', 'park', 'drzew', 'trawnik'],
  },
  {
    category: 'Transport publiczny',
    keywords: ['autobus', 'tramwaj', 'przystanek', 'komunikac'],
  },
  {
    category: 'Sport i rekreacja',
    keywords: ['sport', 'boisko', 'plac zabaw', 'rekreac'],
  },
];

function createTitle(description: string) {
  const normalizedDescription = description.trim().replace(/\s+/g, ' ');
  const firstSentence = normalizedDescription.split(/[.!?]/)[0]?.trim();
  const title = firstSentence || normalizedDescription;
  return title.length > 100 ? `${title.slice(0, 97).trimEnd()}...` : title;
}

function inferCategory(description: string) {
  const normalizedDescription = description.toLocaleLowerCase('pl-PL');
  return (
    categoryKeywords.find(({ keywords }) =>
      keywords.some((keyword) => normalizedDescription.includes(keyword)),
    )?.category ?? 'Infrastruktura drogowa'
  );
}

export function AddIdeaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [idea, setIdea] = useState<Idea>(() => ({
    district: '',
    category: 'Infrastruktura drogowa',
    title: '',
    desc: '',
    status: 'submitted',
  }));
  const [street, setStreet] = useState('');
  const [impact, setImpact] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [catalog, setCatalog] = useState<ApiCatalog | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [canSafelyRetryAnalysis, setCanSafelyRetryAnalysis] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<
    'idle' | 'analyzing' | 'saving' | 'uploading'
  >('idle');
  const [pendingRagSubmission, setPendingRagSubmission] =
    useState<RagSubmission | null>(() => loadPendingRagSubmission());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatedTitle = createTitle(idea.desc);
  const generatedCategory = inferCategory(idea.desc);
  const submissionTitle = idea.title.trim() || generatedTitle;

  useEffect(() => {
    void loadCatalog()
      .then((loadedCatalog) => {
        setCatalog(loadedCatalog);
        setIdea((current) => ({
          ...current,
          district:
            current.district ||
            loadedCatalog.districts.find(
              (district) => district.name === user?.district,
            )?.name ||
            loadedCatalog.districts[0]?.name ||
            '',
          category:
            loadedCatalog.categories.find(
              (category) => category.name === current.category,
            )?.name ||
            loadedCatalog.categories[0]?.name ||
            '',
        }));
      })
      .catch((error) => setSubmitError(getApiErrorMessage(error)));
  }, [user?.district]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  function selectImage(file?: File) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Dozwolone formaty to JPG, PNG i WEBP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Zdjęcie nie może przekraczać 10 MB.');
      return;
    }
    setImageError('');
    setImageFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectImage(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || step !== 3) return;
    const context = [
      idea.desc.trim(),
      street.trim() ? `Dokładna lokalizacja: ${street.trim()}.` : '',
      impact.trim() ? `Dlaczego to ważne: ${impact.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    const district = catalog?.districts.find(
      (item) => item.name === idea.district,
    );
    const category = catalog?.categories.find(
      (item) => item.name === idea.category,
    );
    const status =
      catalog?.statuses.find((item) => {
        const name = item.name.toLowerCase();
        return (
          name.includes('submit') ||
          name.includes('now') ||
          name.includes('zgłos')
        );
      }) ?? catalog?.statuses[0];

    if (!catalog || !district || !category || !status) {
      setSubmitError(
        'Brakuje skonfigurowanej dzielnicy, kategorii lub statusu. Administrator musi najpierw uzupełnić słowniki.',
      );
      return;
    }

    setSubmitting(true);
    setSubmissionStage('analyzing');
    setSubmitError('');
    setCanSafelyRetryAnalysis(false);
    try {
      await api.me();
      const categories = catalog?.categories ?? [];
      const analysisText = `${submissionTitle}\n\n${context}`.trim();
      const ragSubmission =
        pendingRagSubmission &&
        isSameRagPayload(pendingRagSubmission, analysisText, categories)
          ? pendingRagSubmission
          : createRagSubmission(analysisText, categories);
      setPendingRagSubmission(ragSubmission);
      savePendingRagSubmission(ragSubmission);

      const analysis = await analyzeRagSubmission(ragSubmission);
      const analyzedCategoryId = analysis.extraction.concepts[0]?.category;
      const analyzedCategory =
        categories.find((item) => item.id === analyzedCategoryId) ?? category;

      setSubmissionStage('saving');
      const createdIdea = await api.ideas.create({
        title: submissionTitle,
        description: context,
        imageUrl: null,
        districtId: district.id,
        categoryId: analyzedCategory.id,
        categoryIds: [analyzedCategory.id],
        statusId: status.id,
        authorId: user.id,
      });
      if (imageFile) {
        setSubmissionStage('uploading');
        await api.ideas.uploadImage(createdIdea.id, imageFile);
      }
      clearPendingRagSubmission();
      setPendingRagSubmission(null);
      const resultParams = new URLSearchParams({
        dodano: 'true',
        analiza: analysis.extraction.status,
        duplikaty: String(
          analysis.decisions.filter(
            (item) => item.decision.kind === 'duplicate',
          ).length,
        ),
      });
      if (analysis.score !== null) {
        resultParams.set('wynik', String(analysis.score));
      }
      navigate(`/moje-pomysly?${resultParams.toString()}`);
    } catch (error) {
      if (error instanceof RagApiError) {
        if (error.status === 409 || error.status === 422) {
          clearPendingRagSubmission();
          setPendingRagSubmission(null);
        }
        setCanSafelyRetryAnalysis(true);
        setSubmitError(getRagErrorMessage(error));
      } else {
        setCanSafelyRetryAnalysis(false);
        setSubmitError(getApiErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
      setSubmissionStage('idle');
    }
  }

  return (
    <PageMain className={uiTheme.layout.content}>
      <div className="mx-auto w-full max-w-4xl">
        <h1 className={`${uiTheme.text.heading} text-3xl md:text-4xl`}>
          Dodaj pomysł dla Krakowa
        </h1>
        <p className={`${uiTheme.text.body} mt-2 max-w-2xl`}>
          Opisz problem własnymi słowami. System uporządkuje zgłoszenie za
          Ciebie.
        </p>
      </div>

      <ol
        aria-label="Postęp dodawania pomysłu"
        className="mx-auto mt-7 flex w-full max-w-4xl items-center gap-2"
      >
        {['Pomysł', 'Lokalizacja', 'Podsumowanie'].map((label, index) => {
          const number = (index + 1) as 1 | 2 | 3;
          const isActive = step === number;
          const isComplete = step > number;
          return (
            <li
              className={`flex min-w-0 items-center gap-2 ${number < 3 ? 'flex-1' : ''}`}
              key={label}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm leading-none font-bold shadow-sm ${
                  isActive
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : isComplete
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                      : 'border-slate-300 bg-white text-slate-500'
                }`}
              >
                {isComplete ? <Check size={15} /> : number}
              </span>
              <span
                className={`hidden truncate text-xs font-semibold sm:block ${isActive ? 'text-blue-800' : 'text-slate-500'}`}
              >
                {label}
              </span>
              {number < 3 && <span className="h-px flex-1 bg-slate-200" />}
            </li>
          );
        })}
      </ol>

      <form
        className={`${uiTheme.surface.card} mx-auto mt-5 w-full max-w-4xl p-5 md:p-7`}
        onSubmit={handleSubmit}
      >
        {step === 1 && (
          <section aria-labelledby="idea-step-heading">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-800">
                <Sparkles size={21} />
              </span>
              <div>
                <h2 className="text-lg font-semibold" id="idea-step-heading">
                  Co chciałbyś zmienić?
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Nie musisz znać urzędowych nazw ani kategorii.
                </p>
              </div>
            </div>

            <label className={`${uiTheme.text.label} mt-6 block`}>
              Opisz problem lub pomysł
              <textarea
                autoFocus
                className={`${uiTheme.field} mt-2 min-h-36 resize-y py-3 text-base`}
                maxLength={3000}
                onChange={(event) =>
                  setIdea({ ...idea, desc: event.target.value })
                }
                placeholder="Np. Przy szkole na naszej ulicy brakuje bezpiecznego przejścia dla pieszych..."
                required
                value={idea.desc}
              />
              <span className="text-app-text-subtle mt-1 block text-right text-[11px]">
                {idea.desc.length}/3000
              </span>
            </label>

            <div className="mt-3 flex flex-wrap gap-2" aria-label="Przykłady">
              {descriptionSuggestions.map((suggestion) => (
                <button
                  className="rounded-full border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-800"
                  key={suggestion}
                  onClick={() => setIdea({ ...idea, desc: suggestion })}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-5 text-blue-950">
              <Sparkles className="mt-0.5 shrink-0 text-blue-700" size={16} />
              Na podstawie opisu utworzymy tytuł, dobierzemy kategorię i
              przypiszemy pomysł do odpowiedniego obszaru.
            </div>

            <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
              <button
                className={uiTheme.button.primary}
                disabled={idea.desc.trim().length < 15}
                onClick={() => setStep(2)}
                type="button"
              >
                Dalej <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="location-step-heading">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <MapPin size={21} />
              </span>
              <div>
                <h2
                  className="text-lg font-semibold"
                  id="location-step-heading"
                >
                  Gdzie to jest?
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Dzielnicę ustawiliśmy z Twojego profilu. Możesz ją zmienić.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className={uiTheme.text.label}>
                Dzielnica *
                <select
                  className={`${uiTheme.field} mt-2`}
                  onChange={(event) =>
                    setIdea({ ...idea, district: event.target.value })
                  }
                  required
                  value={idea.district}
                >
                  {catalog?.districts.map((district) => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={uiTheme.text.label}>
                Ulica lub charakterystyczne miejsce
                <input
                  className={`${uiTheme.field} mt-2`}
                  onChange={(event) => setStreet(event.target.value)}
                  placeholder="Opcjonalnie"
                  value={street}
                />
              </label>
            </div>

            <label className={`${uiTheme.text.label} mt-5 block`}>
              Dlaczego to ważne? Kto na tym skorzysta?
              <textarea
                className={`${uiTheme.field} mt-2 min-h-24 resize-y py-3`}
                maxLength={1000}
                onChange={(event) => setImpact(event.target.value)}
                placeholder="Opcjonalny kontekst, np. dzieci idące do szkoły, seniorzy, rowerzyści..."
                value={impact}
              />
            </label>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImagePlus size={17} /> Zdjęcie
                <span className="text-app-text-subtle font-normal">
                  (opcjonalnie)
                </span>
              </div>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => selectImage(event.target.files?.[0])}
                ref={fileInputRef}
                type="file"
              />

              <div
                className={`mt-2 flex min-h-20 items-center gap-3 rounded-xl border border-dashed p-3 transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-300'
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                {imagePreview && imageFile ? (
                  <>
                    <img
                      alt="Podgląd wybranego zdjęcia"
                      className="size-14 rounded-lg object-cover"
                      src={imagePreview}
                    />
                    <FileImage className="shrink-0 text-blue-700" size={20} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {imageFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      aria-label="Usuń zdjęcie"
                      className={`${uiTheme.iconButton} text-red-700 hover:bg-red-50`}
                      onClick={() => setImageFile(null)}
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-800">
                      <Upload size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Przeciągnij zdjęcie lub dodaj je z urządzenia
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        JPG, PNG lub WEBP · maks. 10 MB
                      </p>
                    </div>
                    <button
                      className={uiTheme.button.secondary}
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      Dodaj zdjęcie
                    </button>
                  </>
                )}
              </div>
              {imageError && (
                <p
                  className="mt-2 text-xs font-medium text-red-700"
                  role="alert"
                >
                  {imageError}
                </p>
              )}
              {imageFile && !imageError && (
                <p
                  className="mt-2 text-xs font-medium text-emerald-800"
                  role="status"
                >
                  Zdjęcie zostanie wysłane po zapisaniu pomysłu.
                </p>
              )}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                className={uiTheme.button.ghost}
                onClick={() => setStep(1)}
                type="button"
              >
                <ArrowLeft size={17} /> Wstecz
              </button>
              <button
                className={uiTheme.button.primary}
                onClick={() => {
                  const inferredCategory = catalog?.categories.find(
                    (category) => category.name === generatedCategory,
                  )?.name;
                  setIdea((current) => ({
                    ...current,
                    title: current.title || generatedTitle,
                    category:
                      inferredCategory ||
                      current.category ||
                      catalog?.categories[0]?.name ||
                      '',
                  }));
                  setStep(3);
                }}
                type="button"
              >
                Dalej <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="summary-step-heading">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-800">
                <Sparkles size={21} />
              </span>
              <div>
                <h2 className="text-lg font-semibold" id="summary-step-heading">
                  Podsumowanie
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Sprawdź dane przed wysłaniem.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-white/45 p-5 md:p-6">
              <label className={uiTheme.text.label}>
                Tytuł pomysłu
                <input
                  className={`${uiTheme.field} mt-2 text-base font-semibold`}
                  maxLength={150}
                  onChange={(event) =>
                    setIdea({ ...idea, title: event.target.value })
                  }
                  required
                  value={idea.title}
                />
              </label>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {idea.desc}
              </p>
              <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500">Kategoria</dt>
                  <dd className="mt-1">
                    <select
                      aria-label="Kategoria pomysłu"
                      className={`${uiTheme.field} h-10 py-1.5 text-sm font-semibold`}
                      onChange={(event) =>
                        setIdea({ ...idea, category: event.target.value })
                      }
                      required
                      value={idea.category}
                    >
                      {catalog?.categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Obszar</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {idea.district}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Zasięg</dt>
                  <dd className="mt-1 font-semibold text-slate-800">Lokalny</dd>
                </div>
              </dl>
              {(street || impact || imageFile) && (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5 text-xs text-slate-600">
                  {street && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                      <MapPin className="mr-1 inline" size={12} /> {street}
                    </span>
                  )}
                  {impact && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                      Dodano uzasadnienie
                    </span>
                  )}
                  {imageFile && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-900">
                      <ImagePlus className="mr-1 inline" size={12} /> Zdjęcie
                      gotowe do wysłania
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
              <button
                className={uiTheme.button.ghost}
                onClick={() => setStep(2)}
                type="button"
              >
                <ArrowLeft size={17} /> Edytuj
              </button>
              <button
                className={uiTheme.button.primary}
                disabled={submitting}
                type="submit"
              >
                <Send size={17} />
                {submissionStage === 'analyzing'
                  ? 'Analizowanie pomysłu…'
                  : submissionStage === 'saving'
                    ? 'Zapisywanie pomysłu…'
                    : submissionStage === 'uploading'
                      ? 'Wysyłanie zdjęcia…'
                      : 'Wyślij pomysł'}
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Przed zapisem opis zostanie przeanalizowany pod kątem kategorii,
              podobnych koncepcji i orientacyjnego priorytetu. Analiza może
              potrwać dłuższą chwilę.
            </p>
            {submitError && (
              <div
                className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800"
                role="alert"
              >
                <p className="font-medium">{submitError}</p>
                {canSafelyRetryAnalysis && (
                  <p className="mt-1 text-xs leading-5">
                    Kliknij ponownie „Wyślij pomysł”. Jeśli dane się nie
                    zmieniły, analiza użyje tego samego identyfikatora i
                    bezpiecznego mechanizmu ponawiania.
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </form>
    </PageMain>
  );
}
