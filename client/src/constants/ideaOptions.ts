import type { IdeaStatus } from '../types/domain';

export const IDEA_CATEGORIES = [
  'Bezpieczeństwo',
  'Czystość i odpady',
  'Edukacja',
  'Infrastruktura drogowa',
  'Infrastruktura rowerowa',
  'Kultura',
  'Sport i rekreacja',
  'Tereny zielone',
  'Transport publiczny',
  'Zdrowie i dostępność',
] as const;

export const IDEA_STATUS_OPTIONS: Array<{ value: IdeaStatus; label: string }> =
  [
    { value: 'submitted', label: 'Nowe zgłoszenie' },
    { value: 'under_review', label: 'W analizie' },
    { value: 'accepted', label: 'Przyjęte do realizacji' },
    { value: 'in_progress', label: 'W realizacji' },
    { value: 'completed', label: 'Zrealizowane' },
    { value: 'rejected', label: 'Odrzucone' },
  ];
