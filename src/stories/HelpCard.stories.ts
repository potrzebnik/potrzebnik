import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HelpCard from '@/components/shared/HelpCard';

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
    badges: ['Pilne'],
    price: '150,00 PLN',
  },
};

export const ZestawFarby: Story = {
  args: {
    title: 'Zestaw farb akrylowych i podobrazi',
    description: 'Świetlica Środowiskowa "Przystań"',
    image: '/art-supplies.jpg',
    badges: ['Niedługo wygasa'],
    price: '70,00 PLN',
  },
};

export const Spiwory: Story = {
  args: {
    title: '5 ciepłych śpiworów',
    description: 'Fundacja "Daj Herbatę"',
    image: '/sleeping-bags.jpg',
    badges: ['Pilne'],
    price: '300,00 PLN',
  },
};

export const Example: Story = {
  args: {
    title: 'Example',
    description: 'Example opis"',
    image: '/children.jpg',
    badges: ['Pilne', 'Niedługo wygasa', 'Niedługo wygasa', 'Niedługo wygasa'],
    price: '1700,00 PLN',
  },
};
