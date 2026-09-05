import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
    onDotClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = canvas.getAllByRole('button', {
      name: /Przejdź do slajdu/,
    });

    // One dot per slide; the first slide is active on mount.
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
    expect(dots[0]).toHaveAttribute('aria-label', 'Przejdź do slajdu 1');

    // Clicking a dot reports the clicked index.
    await userEvent.click(dots[1]);
    expect(args.onDotClick).toHaveBeenCalledWith(1);
  },
};

export const ActiveMiddle: Story = {
  args: {
    count: 3,
    current: 1,
    onDotClick: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = canvas.getAllByRole('button', {
      name: /Przejdź do slajdu/,
    });

    expect(dots[1]).toHaveAttribute('aria-current', 'true');
    expect(dots[0]).not.toHaveAttribute('aria-current');
  },
};

export const SingleSlide: Story = {
  args: {
    count: 1,
    current: 0,
    onDotClick: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = canvas.queryAllByRole('button', {
      name: /Przejdź do slajdu/,
    });

    expect(dots).toHaveLength(0);
  },
};
