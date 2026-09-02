import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { PublicHeader } from '@/components/features/public-header';

const meta = {
  title: 'Features/PublicHeader',
  component: PublicHeader,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PublicHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

// Szeroki widok — wariant `hidden md:block` z nawigacją poziomą.
// Viewport przypięty JAWNIE (≥ 768px): globalny viewport w UI jest "sticky"
// między stories, więc bez tego `Desktop` odziedziczyłby wąski viewport po
// obejrzeniu `Mobile` i pokazał mobilny layout.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
};

// Wąski widok — wariant `md:hidden` z przyciskiem hamburgera.
// Viewport w formacie '{width}-{height}' (< 768px, poniżej breakpointu `md`).
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Otwórz menu' }));

    await expect(
      canvas.getByRole('button', { name: 'Zamknij menu' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};
