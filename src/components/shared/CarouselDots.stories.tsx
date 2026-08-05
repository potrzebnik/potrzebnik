import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CarouselDots from '@/components/shared/CarouselDots';

const meta = {
  title: 'Shared/CarouselDots',
  component: CarouselDots,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CarouselDots>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    current: 0,
    onDotClick: () => {},
  },
};

export const ActiveMiddle: Story = {
  args: {
    count: 3,
    current: 1,
    onDotClick: () => {},
  },
};
