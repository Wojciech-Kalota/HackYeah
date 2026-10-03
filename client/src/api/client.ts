const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    let message = text || `Błąd HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(text) as { detail?: string; title?: string };
      message = parsed.detail ?? parsed.title ?? message;
    } catch {
      // The API also returns plain-text validation messages.
    }
    throw new ApiError(message.replace(/^"|"$/g, ''), response.status);
  }

  if (!text) return undefined as T;
  return response.headers.get('content-type')?.includes('application/json')
    ? (JSON.parse(text) as T)
    : (text as T);
}

function json(method: string, body?: unknown): RequestInit {
  return {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export type Role = 'ADMIN_USER' | 'NORMAL_USER';

export type ApiUser = {
  id: string;
  email: string;
  nameFirst: string;
  nameLast: string;
  roles: Role[];
};

export type RegisterRequest = {
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  roles: Role[];
};

export type Session = {
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type NamedResource = { id: string; name: string };

export type ApiIdea = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  districtId: string;
  categoryId: string;
  statusId: string;
  authorId: string;
  categoryIds: string[];
  createdAt: string;
  lastUpdatedAt: string;
};

export type IdeaRequest = Omit<ApiIdea, 'id' | 'createdAt' | 'lastUpdatedAt'>;

export type ApiComment = { id: string; text: string; userId: string };

export const api = {
  health: () => request<string>('/api/utils/health'),

  register: (body: RegisterRequest) =>
    request<ApiUser>('/api/user/register', json('POST', body)),
  me: () => request<ApiUser>('/api/user/me'),

  login: (email: string, password: string) =>
    request<Session>('/api/session', json('POST', { email, password })),
  logout: () => request<void>('/api/session', { method: 'DELETE' }),

  categories: {
    list: () => request<NamedResource[]>('/api/categories'),
    create: (name: string) =>
      request<NamedResource>('/api/categories', json('POST', { name })),
    update: (id: string, name: string) =>
      request<NamedResource>(
        `/api/categories/${id}`,
        json('PATCH', { id, name }),
      ),
    delete: (id: string) =>
      request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  districts: {
    list: () => request<NamedResource[]>('/api/districts'),
    create: (name: string) =>
      request<NamedResource>('/api/districts', json('POST', { name })),
    update: (id: string, name: string) =>
      request<NamedResource>(
        `/api/districts/${id}`,
        json('PATCH', { id, name }),
      ),
    delete: (id: string) =>
      request<void>(`/api/districts/${id}`, { method: 'DELETE' }),
  },

  statuses: {
    list: () => request<NamedResource[]>('/api/statuses'),
    create: (name: string) =>
      request<NamedResource>('/api/statuses', json('POST', { name })),
    update: (id: string, name: string) =>
      request<NamedResource>(
        `/api/statuses/${id}`,
        json('PATCH', { id, name }),
      ),
    delete: (id: string) =>
      request<void>(`/api/statuses/${id}`, { method: 'DELETE' }),
  },

  ideas: {
    list: () => request<ApiIdea[]>('/api/ideas'),
    get: (id: string) => request<ApiIdea>(`/api/ideas/${id}`),
    create: (body: IdeaRequest) =>
      request<ApiIdea>('/api/ideas', json('POST', body)),
    update: (id: string, body: IdeaRequest) =>
      request<ApiIdea>(`/api/ideas/${id}`, json('PATCH', body)),
    delete: (id: string) =>
      request<void>(`/api/ideas/${id}`, { method: 'DELETE' }),
    comments: {
      list: (ideaId: string) =>
        request<ApiComment[]>(`/api/ideas/${ideaId}/comments`),
      create: (ideaId: string, text: string) =>
        request<ApiComment>(
          `/api/ideas/${ideaId}/comments`,
          json('POST', { text }),
        ),
      update: (commentId: string, text: string) =>
        request<ApiComment>(
          `/api/ideas/${commentId}/comments`,
          json('PUT', { text }),
        ),
      delete: (commentId: string) =>
        request<void>(`/api/ideas/${commentId}/comments`, {
          method: 'DELETE',
        }),
    },
  },
};

export function getApiErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Nie udało się połączyć z serwerem.';
}
