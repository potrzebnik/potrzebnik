import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HelpCard from '@/components/shared/HelpCard';
import { BADGES } from '@/lib/constants';

const meta = {
  title: 'Shared/HelpCard',
  component: HelpCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof HelpCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KarmaRenal: Story = {
  args: {
    title: 'Specjalistyczna karma Royal Canin Renal',
    description: 'Schronisko "Promyk" w Gdańsku',
    image: '/dogs-shelter.jpg',
    badges: [BADGES.URGENT],
    price: 150,
    currency: 'PLN',
  },
};

export const ArtSupplies: Story = {
  args: {
    title: 'Zestaw farb akrylowych i podobrazi',
    description: 'Świetlica Środowiskowa "Przystań"',
    image: '/art-supplies.jpg',
    badges: [BADGES.EXPIRING, BADGES.NEW],
    price: 70,
    currency: 'PLN',
  },
};

export const SleepingBags: Story = {
  args: {
    title: '5 ciepłych śpiworów',
    description: 'Fundacja "Daj Herbatę"',
    image: '/sleeping-bags.jpg',
    badges: [BADGES.URGENT, BADGES.EXPIRING, BADGES.NEW, BADGES.ONGOING],
    price: 3000,
    currency: 'PLN',
  },
};

export const ManyBadges: Story = {
  args: {
    title: 'Zestaw artykułów szkolnych',
    description: 'Szkoła Podstawowa nr 7 w Krakowie',
    image: '/children.jpg',
    badges: [
      BADGES.URGENT,
      BADGES.EXPIRING,
      BADGES.NEW,
      BADGES.ONGOING,
      BADGES.URGENT,
      BADGES.EXPIRING,
    ],
    price: 450,
    currency: 'PLN',
  },
};
