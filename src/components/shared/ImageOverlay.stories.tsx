import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ImageOverlay from '@/components/shared/ImageOverlay';

const meta = {
  title: 'Shared/ImageOverlay',
  component: ImageOverlay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['yellow', 'blue', 'green'],
    },
  },
  // Kształty są `absolute z-[-1]`, więc potrzebują pozycjonowanego, przezroczystego
  // rodzica o ustalonym rozmiarze, żeby były widoczne w izolacji.
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Yellow: Story = {
  args: { variant: 'yellow' },
};

export const Blue: Story = {
  args: { variant: 'blue' },
};

export const Green: Story = {
  args: { variant: 'green' },
};
