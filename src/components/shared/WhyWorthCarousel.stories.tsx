import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import WhyWorthCarousel, {
  WHY_WORTH_ITEMS,
} from '@/components/shared/WhyWorthCarousel';

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dots = canvas.getAllByRole('button', {
      name: /Przejdź do slajdu/,
    });

    // One dot per slide; the first slide is active on mount.
    expect(dots).toHaveLength(WHY_WORTH_ITEMS.length);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');

    // Clicking a dot scrolls the carousel and activates that slide.
    await userEvent.click(dots[2]);
    expect(dots[2]).toHaveAttribute('aria-current', 'true');
    expect(dots[0]).not.toHaveAttribute('aria-current');

    // Clicking the first dot scrolls back.
    await userEvent.click(dots[0]);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
  },
};
