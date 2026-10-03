import type { Comment, Duplicate, Upvote } from '../types/domain';

export type DashboardStatId =
  'submitted' | 'under_review' | 'in_progress' | 'completed';

export type DashboardStat = {
  id: DashboardStatId;
  label: string;
  value: number;
  description: string;
  badge: string;
};

export const stats: DashboardStat[] = [
  {
    id: 'submitted',
    label: 'Twoje zgłoszenia',
    value: 6,
    description: 'Złożone w latach 2023–2026',
    badge: 'Twój wkład',
  },
  {
    id: 'under_review',
    label: 'W analizie',
    value: 2,
    description: 'ZDMK Kraków i ZZM',
    badge: 'Aktywne',
  },
  {
    id: 'in_progress',
    label: 'W realizacji',
    value: 1,
    description: 'Procedura przetargowa',
    badge: 'Etap prac',
  },
  {
    id: 'completed',
    label: 'Zrealizowane',
    value: 3,
    description: 'Oddane do użytku',
    badge: 'Sukces',
  },
];

export type ReportStatus =
  'submitted' | 'under_review' | 'accepted' | 'in_progress' | 'completed';

export type Report = {
  id: number | string;
  district: string;
  category: string;
  title: string;
  description: string;
  status: ReportStatus;
  comments: number;
  support: number;
  updatedAt: string;
  image: string;
};

export const reports: Report[] = [
  {
    id: 1,
    district: 'Krowodrza',
    category: 'Infrastruktura drogowa',
    title:
      'Nowe doświetlone przejście dla pieszych przy al. Juliusza Słowackiego',
    description:
      'Instalacja azylu dla pieszych z aktywnym oświetleniem LED i czujnikami ruchu przy skrzyżowaniu.',
    status: 'under_review',
    comments: 48,
    support: 342,
    updatedAt: '2026-10-01T10:30:00Z',
    image:
      'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 2,
    district: 'Prądnik Biały',
    category: 'Tereny zielone',
    title: 'Więcej zieleni i cienia na rynku osiedlowym',
    description:
      'Montaż drewnianych pergoli porośniętych zielenią, nowych ławek oraz poidełka dla mieszkańców.',
    status: 'accepted',
    comments: 29,
    support: 218,
    updatedAt: '2026-09-28T08:15:00Z',
    image:
      'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 3,
    district: 'Podgórze',
    category: 'Transport publiczny',
    title: 'Wiata przystankowa przy ul. Wielickiej',
    description:
      'Zadaszenie przystanku, ławka oraz elektroniczna tablica z czasem przyjazdu autobusów.',
    status: 'under_review',
    comments: 17,
    support: 156,
    updatedAt: '2026-09-25T13:00:00Z',
    image:
      'https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 4,
    district: 'Nowa Huta',
    category: 'Bezpieczeństwo',
    title: 'Dodatkowe oświetlenie alejek przy Zalewie Nowohuckim',
    description:
      'Uzupełnienie oświetlenia na najczęściej uczęszczanym odcinku trasy spacerowej i rowerowej.',
    status: 'submitted',
    comments: 12,
    support: 94,
    updatedAt: '2026-09-22T16:45:00Z',
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 5,
    district: 'Stare Miasto',
    category: 'Czystość',
    title: 'Więcej koszy do segregacji odpadów na Plantach',
    description:
      'Rozstawienie estetycznych zestawów do segregacji odpadów przy głównych wejściach na Planty.',
    status: 'in_progress',
    comments: 34,
    support: 287,
    updatedAt: '2026-09-18T11:20:00Z',
    image:
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 6,
    district: 'Dębniki',
    category: 'Sport i rekreacja',
    title: 'Plenerowa strefa ćwiczeń nad Zakrzówkiem',
    description:
      'Niewielka strefa treningowa z bezpieczną nawierzchnią i urządzeniami dostępnymi dla seniorów.',
    status: 'accepted',
    comments: 41,
    support: 401,
    updatedAt: '2026-09-15T09:10:00Z',
    image:
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 7,
    district: 'Bronowice',
    category: 'Infrastruktura rowerowa',
    title: 'Stojaki rowerowe przy pętli tramwajowej',
    description:
      'Zadaszone i monitorowane miejsca postojowe dla rowerów przy węźle przesiadkowym.',
    status: 'completed',
    comments: 23,
    support: 193,
    updatedAt: '2026-09-10T07:50:00Z',
    image:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 8,
    district: 'Grzegórzki',
    category: 'Tereny zielone',
    title: 'Kieszonkowy park przy ul. Mogilskiej',
    description:
      'Zagospodarowanie niewielkiego miejskiego terenu zielenią, ławkami i ogrodem deszczowym.',
    status: 'submitted',
    comments: 19,
    support: 176,
    updatedAt: '2026-09-05T14:30:00Z',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=640&q=80',
  },
];

export const citizenIdeas: Report[] = [
  {
    id: 9,
    district: 'Czyżyny',
    category: 'Sport i rekreacja',
    title: 'Rodzinny plac zabaw w Parku Lotników',
    description:
      'Rozbudowa istniejącej strefy o urządzenia integracyjne, zacienione miejsca odpoczynku i bezpieczną nawierzchnię.',
    status: 'under_review',
    comments: 37,
    support: 264,
    updatedAt: '2026-10-03T08:20:00Z',
    image:
      'https://images.unsplash.com/photo-1596997000103-e597b3ca50df?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 10,
    district: 'Bieżanów-Prokocim',
    category: 'Transport publiczny',
    title: 'Częstsze kursy autobusów w godzinach porannych',
    description:
      'Zwiększenie częstotliwości kursów na najbardziej obciążonych liniach między osiedlami a centrum miasta.',
    status: 'submitted',
    comments: 52,
    support: 438,
    updatedAt: '2026-10-02T14:05:00Z',
    image:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 11,
    district: 'Zwierzyniec',
    category: 'Infrastruktura rowerowa',
    title: 'Bezpieczne połączenie rowerowe z Błoniami',
    description:
      'Wydzielenie brakującego odcinka drogi rowerowej oraz uporządkowanie przejazdu przez ruchliwe skrzyżowanie.',
    status: 'accepted',
    comments: 31,
    support: 356,
    updatedAt: '2026-09-30T10:40:00Z',
    image:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 12,
    district: 'Mistrzejowice',
    category: 'Zdrowie i dostępność',
    title: 'Ławki z podłokietnikami przy przychodni',
    description:
      'Montaż wygodnych ławek dostosowanych do potrzeb seniorów na trasie między przystankiem a przychodnią.',
    status: 'in_progress',
    comments: 14,
    support: 129,
    updatedAt: '2026-09-27T12:15:00Z',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 13,
    district: 'Podgórze Duchackie',
    category: 'Czystość i odpady',
    title: 'Osiedlowy punkt wymiany rzeczy używanych',
    description:
      'Uruchomienie zadaszonego punktu, w którym mieszkańcy mogą zostawiać sprawne książki, zabawki i drobne wyposażenie.',
    status: 'completed',
    comments: 26,
    support: 211,
    updatedAt: '2026-09-24T15:30:00Z',
    image:
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=640&q=80',
  },
];

export const completedProject = {
  title: 'Nowe ławki i alejki w Parku Jordana',
  description:
    '532 głosy mieszkańców. Projekt ukończono i odebrano technicznie.',
  image:
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
};

export type IdeaRelations = {
  comments: Comment[];
  upvotes: Upvote[];
  duplicates: Duplicate[];
};

export const exampleIdeaRelations: IdeaRelations = {
  comments: [
    {
      user_id: 'usr_krk_1042',
      date: '2026-10-02T17:42:00Z',
      text: 'To przejście jest szczególnie niebezpieczne po zmroku. Bardzo potrzebna inicjatywa.',
    },
    {
      user_id: 'usr_krk_0871',
      date: '2026-10-01T09:18:00Z',
      text: 'Warto uwzględnić również obniżenie krawężników dla wózków i osób z niepełnosprawnościami.',
    },
    {
      user_id: 'usr_krk_2215',
      date: '2026-09-29T20:05:00Z',
      text: 'Popieram. Rano korzysta z tego przejścia bardzo dużo dzieci idących do pobliskiej szkoły.',
    },
  ],
  upvotes: [
    { user_id: 'usr_krk_1042', date: '2026-10-02T17:40:00Z' },
    { user_id: 'usr_krk_0871', date: '2026-10-01T09:15:00Z', quantity: 1 },
    { user_id: 'usr_krk_2215', date: '2026-09-29T20:01:00Z' },
    { user_id: 'usr_krk_0314', date: '2026-09-28T14:22:00Z', quantity: 1 },
  ],
  duplicates: [
    {
      idea_id: 'idea_0021',
      title: 'Lepsze oświetlenie przejścia przy Słowackiego',
      desc: 'Montaż dodatkowych lamp nad przejściem dla pieszych oraz poprawa widoczności oznakowania.',
      img: 'https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&w=640&q=80',
    },
    {
      idea_id: 'idea_0148',
      title: 'Bezpieczna droga do szkoły w Krowodrzy',
      desc: 'Doświetlenie przejść, montaż progów wyspowych i odnowienie oznakowania w rejonie szkoły.',
      img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=640&q=80',
    },
  ],
};
