import {
  api,
  getApiFileUrl,
  type ApiIdea,
  type IdeaFilters,
  type NamedResource,
} from './client';
import type { IdeaStatus, Report, ReportStatus } from '../types/domain';

export type ApiCatalog = {
  categories: NamedResource[];
  districts: NamedResource[];
  statuses: NamedResource[];
};

function normalizeStatus(name?: string): ReportStatus {
  const normalized = name?.toLowerCase().replace(/[ -]+/g, '_');
  if (normalized === 'rejected' || normalized?.includes('odrzu'))
    return 'rejected';
  if (normalized === 'completed' || normalized?.includes('zrealiz'))
    return 'completed';
  if (normalized?.includes('review') || normalized?.includes('analiz'))
    return 'under_review';
  if (normalized?.includes('accept') || normalized?.includes('przyj'))
    return 'accepted';
  if (normalized?.includes('progress') || normalized?.includes('realiz'))
    return 'in_progress';
  return 'submitted';
}

export function ideaStatus(name?: string): IdeaStatus {
  return normalizeStatus(name);
}

export function mapIdeaToReport(
  idea: ApiIdea,
  catalog: ApiCatalog,
  comments = 0,
): Report {
  const byId = (items: NamedResource[], id?: string) =>
    items.find((item) => item.id === id)?.name;
  return {
    id: idea.id,
    duplicateOfId: idea.duplicateOfId,
    district: byId(catalog.districts, idea.districtId) ?? 'Nieznana dzielnica',
    category:
      byId(catalog.categories, idea.categoryIds[0] ?? idea.categoryId) ??
      'Bez kategorii',
    title: idea.title,
    description: idea.description,
    status: normalizeStatus(byId(catalog.statuses, idea.statusId)),
    comments,
    votes: idea.votes ?? 0,
    hasVoted: idea.hasVoted ?? false,
    updatedAt: idea.updatedAt || idea.lastUpdatedAt || idea.createdAt,
    image: getApiFileUrl(idea.imageUrl),
  };
}

export async function loadCatalog(): Promise<ApiCatalog> {
  const [categories, districts, statuses] = await Promise.all([
    api.categories.list(),
    api.districts.list(),
    api.statuses.list(),
  ]);
  return { categories, districts, statuses };
}

export type ReportsData = {
  ideas: ApiIdea[];
  catalog: ApiCatalog;
  reports: Report[];
  currentPage: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
  totalPages: number;
};

export type ReportQuery = {
  district?: string;
  category?: string;
  status?: ReportStatus;
  query?: string;
  authoredByMe?: boolean;
  upVotedByMe?: boolean;
  page?: number;
  pageSize?: number;
};

const pendingReportsRequests = new Map<string, Promise<ReportsData>>();

async function fetchReports(options: ReportQuery): Promise<ReportsData> {
  const catalog = await loadCatalog();
  const districtId = catalog.districts.find(
    (item) => item.name === options.district,
  )?.id;
  const categoryId = catalog.categories.find(
    (item) => item.name === options.category,
  )?.id;
  const statusId = catalog.statuses.find(
    (item) => ideaStatus(item.name) === options.status,
  )?.id;
  const filters: IdeaFilters = {
    districtIds: districtId ? [districtId] : undefined,
    categoryIds: categoryId ? [categoryId] : undefined,
    statusIds: statusId ? [statusId] : undefined,
    name: options.query,
    authoredByMe: options.authoredByMe,
    upVotedByMe: options.upVotedByMe,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 100,
  };
  const ideasPage = options.authoredByMe
    ? await api.ideas.list(filters)
    : await api.ideas.listOriginals(filters);
  const ideas = ideasPage.items;
  const commentResults = await Promise.allSettled(
    ideas.map((idea) => api.ideas.comments.list(idea.id)),
  );
  return {
    ideas,
    catalog,
    reports: ideas.map((idea, index) => {
      const comments = commentResults[index];
      return mapIdeaToReport(
        idea,
        catalog,
        comments.status === 'fulfilled' ? comments.value.length : 0,
      );
    }),
    currentPage: ideasPage.currentPage,
    pageSize: ideasPage.pageSize,
    pageCount: ideasPage.pageCount,
    totalCount: ideasPage.totalCount,
    totalPages: ideasPage.totalPages,
  };
}

export function loadReports(options: ReportQuery = {}): Promise<ReportsData> {
  const requestKey = JSON.stringify(options);
  const pendingRequest = pendingReportsRequests.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const request = fetchReports(options).finally(() => {
    pendingReportsRequests.delete(requestKey);
  });
  pendingReportsRequests.set(requestKey, request);
  return request;
}
