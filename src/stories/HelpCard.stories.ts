import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HelpCard from '@/components/shared/HelpCard';
import { BADGES } from '@/lib/constants';

const meta = {
  title: 'Shared/HelpCard',
  component: HelpCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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

export const ZestawFarby: Story = {
  args: {
    title: 'Zestaw farb akrylowych i podobrazi',
    description: 'Świetlica Środowiskowa "Przystań"',
    image: '/art-supplies.jpg',
    badges: [BADGES.EXPIRING],
    price: 70,
    currency: 'PLN',
  },
};

export const Spiwory: Story = {
  args: {
    title: '5 ciepłych śpiworów',
    description: 'Fundacja "Daj Herbatę"',
    image: '/sleeping-bags.jpg',
    badges: [BADGES.EXPIRING],
    price: 300,
    currency: 'PLN',
  },
};

export const Example: Story = {
  args: {
    title: 'Example',
    description: 'Example opis"',
    image: '/children.jpg',
    badges: [BADGES.EXPIRING, BADGES.EXPIRING, BADGES.NEW],
    price: 1700,
    currency: 'PLN',
  },
};
