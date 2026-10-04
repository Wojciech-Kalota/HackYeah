import { api, type ApiIdea, type NamedResource } from './client';
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
  const byId = (items: NamedResource[], id: string) =>
    items.find((item) => item.id === id)?.name;
  return {
    id: idea.id,
    district: byId(catalog.districts, idea.districtId) ?? 'Nieznana dzielnica',
    category:
      byId(catalog.categories, idea.categoryIds[0] ?? idea.categoryId) ??
      'Bez kategorii',
    title: idea.title,
    description: idea.description,
    status: normalizeStatus(byId(catalog.statuses, idea.statusId)),
    comments,
    updatedAt: idea.lastUpdatedAt || idea.createdAt,
    image: idea.imageUrl ?? '',
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
};

let pendingReportsRequest: Promise<ReportsData> | null = null;

async function fetchReports(): Promise<ReportsData> {
  const [ideas, catalog] = await Promise.all([api.ideas.list(), loadCatalog()]);
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
  };
}

export function loadReports(): Promise<ReportsData> {
  if (pendingReportsRequest) return pendingReportsRequest;

  pendingReportsRequest = fetchReports().finally(() => {
    pendingReportsRequest = null;
  });
  return pendingReportsRequest;
}
