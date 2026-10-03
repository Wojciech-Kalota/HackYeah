import { api, type ApiIdea, type NamedResource } from './client';
import type { IdeaStatus } from '../types/domain';
import type { Report, ReportStatus } from '../utils/dummyData';

export type ApiCatalog = {
  categories: NamedResource[];
  districts: NamedResource[];
  statuses: NamedResource[];
};

function normalizeStatus(name?: string): ReportStatus {
  const normalized = name?.toLowerCase().replace(/[ -]+/g, '_');
  if (normalized?.includes('review') || normalized?.includes('analiz'))
    return 'under_review';
  if (normalized?.includes('accept') || normalized?.includes('przyj'))
    return 'accepted';
  if (normalized?.includes('progress') || normalized?.includes('realiz'))
    return 'in_progress';
  if (normalized?.includes('complete') || normalized?.includes('zrealiz'))
    return 'completed';
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
    support: 0,
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

export async function loadReports() {
  const [ideas, catalog] = await Promise.all([api.ideas.list(), loadCatalog()]);
  const commentLists = await Promise.all(
    ideas.map((idea) => api.ideas.comments.list(idea.id)),
  );
  return {
    ideas,
    catalog,
    reports: ideas.map((idea, index) =>
      mapIdeaToReport(idea, catalog, commentLists[index].length),
    ),
  };
}
