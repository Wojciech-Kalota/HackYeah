// ES module. API URL comes from frontend configuration, never an OpenAI key.
export function createSubmission(text, categories) {
  return {
    submission_id: crypto.randomUUID(),
    text,
    categories: categories.map(({ id, label }) => ({ id, label })),
  };
}

// Keep submission unchanged for retries, including after timeout or 502/503.
// Only createSubmission for a NEW submission, not inside a retry handler.
export async function analyzeSubmission(apiBaseUrl, submission) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15 * 60 * 1000);
  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/ideas/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
        signal: controller.signal,
      },
    );
    const body = await response.json();
    if (!response.ok) {
      const error = new Error(body.detail?.message ?? `HTTP ${response.status}`);
      error.status = response.status;
      error.detail = body.detail; // 422 is a list of validation errors.
      error.retryAfter = response.headers.get("Retry-After");
      throw error;
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

// const pending = createSubmission(text, categories);
// const result = await analyzeSubmission("http://127.0.0.1:8000", pending);
// Retry using pending; do not regenerate its submission_id.

// Read stored RAG concepts; these IDs are numbers, not application UUIDs.
async function readIdeasJson(url) {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.detail?.message ?? `HTTP ${response.status}`);
    error.status = response.status;
    error.detail = body.detail;
    throw error;
  }
  return body;
}

export function listIdeas(apiBaseUrl, { limit = 20, offset = 0, category } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (category !== undefined && category !== null) params.set("category", category);
  return readIdeasJson(`${apiBaseUrl.replace(/\/$/, "")}/api/ideas?${params}`);
}

export function getIdea(apiBaseUrl, conceptId) {
  return readIdeasJson(`${apiBaseUrl.replace(/\/$/, "")}/api/ideas/${encodeURIComponent(conceptId)}`);
}
