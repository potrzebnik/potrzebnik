import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BrandMark from '@/components/shared/BrandMark';

const meta = {
  title: 'Shared/BrandMark',
  component: BrandMark,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['header', 'footer'],
    },
  },
  args: {
    variant: 'header',
  },
} satisfies Meta<typeof BrandMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Header: Story = {
  args: { variant: 'header' },
};

export const Footer: Story = {
  args: { variant: 'footer' },
};

export const BothVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <BrandMark variant="header" />
      <BrandMark variant="footer" />
    </div>
  ),
};
