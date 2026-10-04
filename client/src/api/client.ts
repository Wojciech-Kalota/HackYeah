const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

const RAG_API_BASE_URL = (
  import.meta.env.VITE_RAG_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

export const AUTH_UNAUTHORIZED_EVENT = 'api:unauthorized';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body && !isFormData
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
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

async function ragRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${RAG_API_BASE_URL}${path}`, {
    ...init,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const text = await response.text();
  if (!response.ok) {
    let message = text || `Błąd RAG HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(text) as {
        detail?: string | { message?: string };
        title?: string;
      };
      message =
        typeof parsed.detail === 'string'
          ? parsed.detail
          : (parsed.detail?.message ?? parsed.title ?? message);
    } catch {
      // FastAPI może zwrócić treść inną niż JSON.
    }
    throw new ApiError(message.replace(/^"|"$/g, ''), response.status);
  }

  return JSON.parse(text) as T;
}

function json(method: string, body?: unknown): RequestInit {
  return {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

function ideaFiltersQuery(filters: IdeaFilters = {}) {
  const params = new URLSearchParams();
  filters.statusIds?.forEach((id) => params.append('StatusIds', id));
  filters.districtIds?.forEach((id) => params.append('DistrictIds', id));
  filters.categoryIds?.forEach((id) => params.append('CategoryIds', id));
  const name = filters.name?.trim();
  if (name) params.set('Name', name);
  if (filters.authoredByMe) params.set('AuthoredByMe', 'true');
  if (filters.upVotedByMe) params.set('UpVotedByMe', 'true');
  if (filters.page) params.set('Page', String(filters.page));
  if (filters.pageSize) params.set('PageSize', String(filters.pageSize));
  const query = params.toString();
  return query ? `?${query}` : '';
}

function normalizeIdeasPage(
  response: PagedResult<ApiIdea> | ApiIdea[],
  filters: IdeaFilters,
): PagedResult<ApiIdea> {
  if (!Array.isArray(response)) return response;

  const normalizedName = filters.name?.trim().toLocaleLowerCase('pl');
  const filtered = response.filter((idea) => {
    const matchesStatus =
      !filters.statusIds?.length || filters.statusIds.includes(idea.statusId);
    const matchesDistrict =
      !filters.districtIds?.length ||
      filters.districtIds.includes(idea.districtId);
    const matchesCategory =
      !filters.categoryIds?.length ||
      idea.categoryIds.some((id) => filters.categoryIds?.includes(id));
    const matchesName =
      !normalizedName ||
      `${idea.title} ${idea.description}`
        .toLocaleLowerCase('pl')
        .includes(normalizedName);
    const matchesVote = !filters.upVotedByMe || idea.hasVoted === true;
    return (
      matchesStatus &&
      matchesDistrict &&
      matchesCategory &&
      matchesName &&
      matchesVote
    );
  });
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.max((filters.pageSize ?? filtered.length) || 1, 1);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return {
    items,
    currentPage: page,
    pageSize,
    pageCount: items.length,
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

export type Role = 'ADMIN_USER' | 'NORMAL_USER';

export type ApiUser = {
  id: string;
  email: string;
  nameFirst: string;
  nameLast: string;
  roles: Role[];
  districtId: string | null;
  districtName: string | null;
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
  categoryId?: string;
  statusId: string;
  authorId: string;
  categoryIds: string[];
  createdAt: string;
  lastUpdatedAt?: string;
  updatedAt?: string;
  votes?: number;
  hasVoted?: boolean;
};

export type IdeaRequest = Omit<
  ApiIdea,
  'id' | 'createdAt' | 'lastUpdatedAt' | 'updatedAt' | 'votes' | 'hasVoted'
>;

export type IdeaFilters = {
  statusIds?: string[];
  districtIds?: string[];
  categoryIds?: string[];
  name?: string;
  authoredByMe?: boolean;
  upVotedByMe?: boolean;
  page?: number;
  pageSize?: number;
};

export type PagedResult<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  totalPages: number;
};

export type ApiComment = { id: string; text: string; userId: string };

export type VoteResult = {
  id: string;
  voteCount: number;
  hasVoted: boolean;
};

export type RagCategory = { id: string; label: string };

export type RagAnalyzeResponse = {
  submission_id: string;
  replayed: boolean;
  score: number | null;
};

export const api = {
  health: () => request<string>('/api/utils/health'),

  register: (body: RegisterRequest) =>
    request<ApiUser>('/api/user/register', json('POST', body)),
  me: () => request<ApiUser>('/api/user/me'),

  login: (email: string, password: string) =>
    request<Session>('/api/session', json('POST', { email, password })),
  logout: () => request<void>('/api/session', { method: 'DELETE' }),

  rag: {
    analyze: (body: {
      submission_id: string;
      text: string;
      categories: RagCategory[];
    }) =>
      ragRequest<RagAnalyzeResponse>('/api/ideas/analyze', json('POST', body)),
  },

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
    list: async (filters: IdeaFilters = {}) => {
      const response = await request<PagedResult<ApiIdea> | ApiIdea[]>(
        `/api/ideas${ideaFiltersQuery(filters)}`,
      );
      return normalizeIdeasPage(response, filters);
    },
    get: (id: string) => request<ApiIdea>(`/api/ideas/${id}`),
    create: (body: IdeaRequest) =>
      request<ApiIdea>('/api/ideas', json('POST', body)),
    uploadImage: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<ApiIdea>(`/api/ideas/${id}`, {
        method: 'POST',
        body: formData,
      });
    },
    update: (id: string, body: IdeaRequest) =>
      request<ApiIdea>(`/api/ideas/${id}`, json('PUT', body)),
    delete: (id: string) =>
      request<void>(`/api/ideas/${id}`, { method: 'DELETE' }),
    changeVote: (id: string) =>
      request<VoteResult>(`/api/ideas/${id}/change-vote`, { method: 'POST' }),
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

export function getApiFileUrl(path: string | null | undefined) {
  if (!path) return '';
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;

  const normalizedPath = path.startsWith('/api/file/')
    ? path
    : `/api/file/${path.replace(/^\/+/, '')}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getApiErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Nie udało się połączyć z serwerem.';

  const normalized = error.message.toLocaleLowerCase('en');
  if (normalized.includes('useralready exists'))
    return 'Konto z tym adresem e-mail już istnieje.';
  if (normalized.includes('invalid creadentials'))
    return 'Nieprawidłowy adres e-mail lub hasło.';
  if (normalized.includes('invalid credentials'))
    return 'Nieprawidłowy adres e-mail lub hasło.';
  return error.message;
}
