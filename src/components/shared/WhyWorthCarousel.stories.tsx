import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WhyWorthCarousel from '@/components/shared/WhyWorthCarousel';
import { WHY_WORTH_ITEMS } from '@/lib/constants';

const meta = {
  title: 'Shared/WhyWorthCarousel',
  component: WhyWorthCarousel,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WhyWorthCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: WHY_WORTH_ITEMS,
  },
};
