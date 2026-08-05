export const APP_NAME = 'Potrzebnik';

export const BADGES = {
  URGENT: { id: 1, label: 'Pilne' },
  EXPIRING: { id: 2, label: 'Niedługo wygasa' },
  NEW: { id: 3, label: 'Nowość' },
  ONGOING: { id: 4, label: 'Zbiórka trwa' },
} as const;

export interface WhyWorthItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const WHY_WORTH_ITEMS: WhyWorthItem[] = [
  {
    id: 'donors',
    title: 'Zaufanie darczyńców',
    description:
      'Darczyńcy wiedzą, że ich pomoc trafia w bezpieczne i uczciwe ręce.',
    image: '/donors.svg',
  },
  {
    id: 'needs',
    title: 'Spełnianie realnych potrzeb',
    description:
      'Dzięki aktualizowanej na bieżąco liście unikasz sytuacji niepotrzebnych darów.',
    image: '/needs.svg',
  },
  {
    id: 'management',
    title: 'Proste zarządzanie',
    description:
      'Intuicyjny panel zarządzania przyspiesza i ułatwia codzienną pracę.',
    image: '/management.svg',
  },
];
