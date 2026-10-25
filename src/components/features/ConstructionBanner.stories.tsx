import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ConstructionBanner } from '@/components/features/ConstructionBanner';

const meta = {
  title: 'Features/ConstructionBanner',
  component: ConstructionBanner,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ConstructionBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

// Title and message on one centred row.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ canvasElement }) => {
    const banner = within(canvasElement).getByRole('complementary', {
      name: 'Informacja o stanie serwisu',
    });
    await expect(banner).toHaveTextContent('Strona w budowie');
  },
};

// Title stacked above the message.
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
};
