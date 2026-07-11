import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PublicFooter } from '@/components/features/public-footer';

const meta = {
  title: 'Features/PublicFooter',
  component: PublicFooter,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PublicFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
