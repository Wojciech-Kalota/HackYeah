import { FileImage, ImagePlus, Lightbulb, Send, Upload, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { IDEA_CATEGORIES, KRAKOW_DISTRICTS } from '../constants/ideaOptions';
import { uiTheme } from '../styles/theme';
import type { Idea } from '../types/domain';
import { saveLocalIdea } from '../utils/localIdeas';

const emptyIdea: Idea = {
  district: 'V Krowodrza',
  category: IDEA_CATEGORIES[0],
  title: '',
  desc: '',
  status: 'submitted',
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AddIdeaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea>(() => ({
    ...emptyIdea,
    district: user?.district ?? emptyIdea.district,
  }));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    // Po podłączeniu API imageFile trafi do multipart/form-data, a backend zwróci wartość pola img.
    saveLocalIdea({ ...idea, img: undefined }, user.id);
    navigate('/moje-pomysly?dodano=true');
  }

  return (
    <main className={uiTheme.layout.content}>
      <div className="max-w-4xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
          <Lightbulb size={14} /> Nowa inicjatywa
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          Dodaj pomysł dla Krakowa
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Opisz problem lub propozycję zmiany. Formularz zapisuje teraz dane
          lokalnie w strukturze gotowej do wysłania do backendu.
        </p>
      </div>

      <form
        className={`${uiTheme.surface.card} mt-7 max-w-4xl p-5 md:p-7`}
        onSubmit={handleSubmit}
      >
        <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-100 text-blue-800">
            <Lightbulb size={21} />
          </span>
          <div>
            <h2 className="font-semibold">Informacje o pomyśle</h2>
            <p className="text-xs text-slate-500">
              Pola oznaczone gwiazdką są wymagane.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Dzielnica *
            <select
              className={`${uiTheme.field} mt-2`}
              onChange={(event) =>
                setIdea({ ...idea, district: event.target.value })
              }
              required
              value={idea.district}
            >
              {KRAKOW_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Kategoria *
            <select
              className={`${uiTheme.field} mt-2`}
              onChange={(event) =>
                setIdea({ ...idea, category: event.target.value })
              }
              required
              value={idea.category}
            >
              {IDEA_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Tytuł *
          <input
            className={`${uiTheme.field} mt-2`}
            maxLength={140}
            onChange={(event) =>
              setIdea({ ...idea, title: event.target.value })
            }
            placeholder="Np. Bezpieczne przejście przy szkole"
            required
            value={idea.title}
          />
          <span className="mt-1 block text-right text-[11px] text-slate-400">
            {idea.title.length}/140
          </span>
        </label>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Opis problemu *
          <textarea
            className={`${uiTheme.field} mt-2 min-h-40 resize-y py-3`}
            maxLength={3000}
            onChange={(event) => setIdea({ ...idea, desc: event.target.value })}
            placeholder="Opisz obecny problem, proponowane rozwiązanie i korzyści dla mieszkańców..."
            required
            value={idea.desc}
          />
          <span className="mt-1 block text-right text-[11px] text-slate-400">
            {idea.desc.length}/3000
          </span>
        </label>

        <div className="mt-5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ImagePlus size={17} /> Zdjęcie problemu
            <span className="font-normal text-slate-400">(opcjonalnie)</span>
          </div>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => selectImage(event.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />

          {imagePreview && imageFile ? (
            <div className="relative mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex h-64 w-full items-center justify-center bg-slate-100 p-3">
                <img
                  alt="Podgląd wybranego zdjęcia"
                  className="max-h-full max-w-full object-contain"
                  src={imagePreview}
                />
              </div>
              <div className="flex items-center gap-3 border-t border-slate-200 bg-white p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-800">
                  <FileImage size={19} />
                </span>
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
                  className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setImageFile(null)}
                  type="button"
                >
                  <X size={19} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`mt-2 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                isDragging
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ')
                  fileInputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-blue-100 text-blue-800">
                <Upload size={25} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                Przeciągnij zdjęcie tutaj lub kliknij, aby wybrać
              </p>
              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG lub WEBP · maksymalnie 10 MB
              </p>
            </div>
          )}
          {imageError && (
            <p className="mt-2 text-xs font-medium text-red-600">
              {imageError}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            onClick={() => navigate(-1)}
            type="button"
          >
            Anuluj
          </button>
          <button className={uiTheme.button.primary} type="submit">
            <Send size={17} /> Zapisz pomysł
          </button>
        </div>
      </form>
    </main>
  );
}
