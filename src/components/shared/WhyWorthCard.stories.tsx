import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WhyWorthCard from '@/components/shared/WhyWorthCard';

const meta = {
  title: 'Shared/WhyWorthCard',
  component: WhyWorthCard,
  parameters: {
    layout: 'centered',
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
