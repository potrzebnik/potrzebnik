import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Stripes from '@/components/shared/Stripes';

const meta = {
  title: 'Shared/Stripes',
  component: Stripes,
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="h-40 w-full">
      <Stripes />
    </div>
  ),
} satisfies Meta<typeof Stripes>;

export default meta;

type Story = StoryObj<typeof meta>;

export const VerticalRight: Story = {
  args: {
    orientation: 'vertical',
    side: 'right',
    count: 21,
  },
  render: (args) => (
    <div className="flex h-40 w-full">
      <Stripes {...args} />
    </div>
  ),
};

export const VerticalLeft: Story = {
  args: {
    orientation: 'vertical',
    side: 'left',
    count: 21,
  },
  render: (args) => (
    <div className="flex h-40 w-full">
      <Stripes {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    count: 21,
  },
  render: (args) => (
    <div className="h-40 w-full">
      <Stripes {...args} />
    </div>
  ),
};
