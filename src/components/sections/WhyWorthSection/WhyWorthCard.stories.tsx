import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WhyWorthCard from './WhyWorthCard';

const meta = {
  title: 'Sections/WhyWorthSection/WhyWorthCard',
  component: WhyWorthCard,
  parameters: {
    layout: 'centered',
  },
  globals: {
    viewport: {
      value: '1280-800',
    },
  },
} satisfies Meta<typeof WhyWorthCard>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    title: 'Zaufanie darczyńców',
    description:
      'Darczyńcy wiedzą, że ich pomoc trafia w bezpieczne i uczciwe ręce.',
    image: '/donors.svg',
  },
};
export const Mobile: Story = {
  args: {
    title: 'Zaufanie darczyńców',
    description:
      'Darczyńcy wiedzą, że ich pomoc trafia w bezpieczne i uczciwe ręce.',
    image: '/donors.svg',
  },
  globals: {
    viewport: {
      value: '390-844',
    },
  },
};
