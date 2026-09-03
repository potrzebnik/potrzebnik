import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BrandMark from '@/components/shared/BrandMark';

const meta = {
  title: 'Shared/BrandMark',
  component: BrandMark,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BrandMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TakesColourFromContext: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <div className="text-header-fg bg-header-bg p-5">
        <BrandMark />
      </div>
      <div className="text-footer-fg bg-footer-bg p-5">
        <BrandMark />
      </div>
    </div>
  ),
};
