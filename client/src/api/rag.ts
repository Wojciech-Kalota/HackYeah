import type { NamedResource } from './client';

const RAG_API_BASE_URL = (
  import.meta.env.VITE_RAG_API_URL ?? 'http://127.0.0.1:8000'
).replace(/\/$/, '');

const RAG_TIMEOUT_MS = 15 * 60 * 1000;
const PENDING_SUBMISSION_KEY = 'e-inicjatywa:pending-rag-submission';
const LEGACY_PENDING_SUBMISSION_KEY = 'glos-miasta:pending-rag-submission';

export type RagCategory = {
  id: string;
  label: string;
};

export type RagSubmission = {
  submission_id: string;
  text: string;
  categories: RagCategory[];
};

export type RagConcept = {
  problem: string;
  audience: string;
  solution: string;
  category: string;
  context: string;
  score: number;
  source_quote: string;
};

export type RagCandidate = {
  concept: Omit<RagConcept, 'source_quote'> & {
    id: number;
    created_at: string;
    liczba_zgloszen: number;
  };
  similarity: number;
};

export type RagDecision = {
  input_concept: RagConcept;
  decision: {
    kind: 'new' | 'duplicate';
    candidate_id: number | null;
    reason: string;
  };
  score: number;
  concept_id: number | null;
  canonical_submission_id?: string | null;
  candidates: RagCandidate[];
  liczba_zgloszen: number | null;
};

export type RagAnalysis = {
  contract_version: 3;
  score: number | null;
  submission_id: string;
  replayed: boolean;
  categories: RagCategory[];
  extraction: {
    status: 'ok' | 'no_concepts';
    concepts: RagConcept[];
  };
  decisions: RagDecision[];
};

export class RagApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly retryAfter?: string | null,
  ) {
    super(message);
  }
}

export function createRagSubmission(
  text: string,
  categories: NamedResource[],
): RagSubmission {
  return {
    submission_id: createUuid(),
    text,
    categories: normalizeCategories(categories),
  };
}

function createUuid() {
  const browserCrypto = globalThis.crypto;
  if (typeof browserCrypto?.randomUUID === 'function') {
    return browserCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof browserCrypto?.getRandomValues === 'function') {
    browserCrypto.getRandomValues(bytes);
  } else {
    // Identyfikator nie jest sekretem; ten wariant utrzymuje kompatybilność
    // ze starszymi przeglądarkami bez Web Crypto.
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  // RFC 4122 UUID v4: ustaw bity wersji i wariantu.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function normalizeCategories(categories: NamedResource[]) {
  return categories
    .map(({ id, name }) => ({ id, label: name }))
    .sort((first, second) => first.id.localeCompare(second.id));
}

export function loadPendingRagSubmission(): RagSubmission | null {
  try {
    const value =
      sessionStorage.getItem(PENDING_SUBMISSION_KEY) ??
      sessionStorage.getItem(LEGACY_PENDING_SUBMISSION_KEY);
    if (!value) return null;
    sessionStorage.setItem(PENDING_SUBMISSION_KEY, value);
    sessionStorage.removeItem(LEGACY_PENDING_SUBMISSION_KEY);
    const parsed = JSON.parse(value) as Partial<RagSubmission>;
    if (
      typeof parsed.submission_id !== 'string' ||
      typeof parsed.text !== 'string' ||
      !Array.isArray(parsed.categories) ||
      !parsed.categories.every(
        (category) =>
          typeof category?.id === 'string' &&
          typeof category?.label === 'string',
      )
    ) {
      sessionStorage.removeItem(PENDING_SUBMISSION_KEY);
      sessionStorage.removeItem(LEGACY_PENDING_SUBMISSION_KEY);
      return null;
    }
    return {
      submission_id: parsed.submission_id,
      text: parsed.text,
      categories: parsed.categories as RagCategory[],
    };
  } catch {
    return null;
  }
}

export function savePendingRagSubmission(submission: RagSubmission) {
  try {
    sessionStorage.setItem(PENDING_SUBMISSION_KEY, JSON.stringify(submission));
    sessionStorage.removeItem(LEGACY_PENDING_SUBMISSION_KEY);
  } catch {
    // Stan React nadal zachowuje identyfikator podczas bieżącej sesji strony.
  }
}

export function clearPendingRagSubmission() {
  try {
    sessionStorage.removeItem(PENDING_SUBMISSION_KEY);
    sessionStorage.removeItem(LEGACY_PENDING_SUBMISSION_KEY);
  } catch {
    // Brak dostępu do storage nie powinien blokować zakończonego zgłoszenia.
  }
}

export function isSameRagPayload(
  submission: RagSubmission,
  text: string,
  categories: NamedResource[],
) {
  const normalizedCategories = normalizeCategories(categories);
  const submissionCategories = [...submission.categories].sort(
    (first, second) => first.id.localeCompare(second.id),
  );
  return (
    submission.text === text &&
    JSON.stringify(submissionCategories) ===
      JSON.stringify(normalizedCategories)
  );
}

export async function analyzeRagSubmission(
  submission: RagSubmission,
): Promise<RagAnalysis> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const response = await fetch(`${RAG_API_BASE_URL}/api/ideas/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_id: submission.submission_id,
        text: submission.text,
        categories: submission.categories,
      }),
      signal: controller.signal,
    });
    const body = (await response.json()) as
      | RagAnalysis
      | {
          detail?:
            { code?: string; message?: string } | Array<{ msg?: string }>;
        };

    if (!response.ok) {
      const detail = 'detail' in body ? body.detail : undefined;
      const message = Array.isArray(detail)
        ? detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(', ')
        : detail?.message;
      throw new RagApiError(
        message || `RAG zwrócił HTTP ${response.status}.`,
        response.status,
        Array.isArray(detail) ? undefined : detail?.code,
        response.headers.get('Retry-After'),
      );
    }

    const analysis = body as RagAnalysis;
    if (analysis.contract_version !== 3) {
      throw new RagApiError(
        'Usługa analizy zwróciła nieobsługiwaną wersję odpowiedzi.',
      );
    }
    return analysis;
  } catch (error) {
    if (error instanceof RagApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new RagApiError(
        'Analiza przekroczyła limit czasu. Możesz ponowić ją z tym samym identyfikatorem.',
      );
    }
    throw new RagApiError(
      'Nie udało się połączyć z usługą analizy. Sprawdź, czy RAG działa na porcie 8000.',
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getRagErrorMessage(error: unknown) {
  if (!(error instanceof RagApiError))
    return 'Analiza pomysłu nie powiodła się.';
  const retryHint = error.retryAfter
    ? ` Spróbuj ponownie za około ${error.retryAfter} s.`
    : '';
  return `${error.message}${retryHint}`;
}
