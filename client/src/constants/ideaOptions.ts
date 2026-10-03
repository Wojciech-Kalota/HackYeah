import type { IdeaStatus } from '../types/domain';

export const KRAKOW_DISTRICTS = [
  'I Stare Miasto',
  'II Grzegórzki',
  'III Prądnik Czerwony',
  'IV Prądnik Biały',
  'V Krowodrza',
  'VI Bronowice',
  'VII Zwierzyniec',
  'VIII Dębniki',
  'IX Łagiewniki-Borek Fałęcki',
  'X Swoszowice',
  'XI Podgórze Duchackie',
  'XII Bieżanów-Prokocim',
  'XIII Podgórze',
  'XIV Czyżyny',
  'XV Mistrzejowice',
  'XVI Bieńczyce',
  'XVII Wzgórza Krzesławickie',
  'XVIII Nowa Huta',
] as const;

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
