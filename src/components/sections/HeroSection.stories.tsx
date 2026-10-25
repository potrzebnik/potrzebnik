import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import HeroSection from '@/components/sections/HeroSection';
import { MANAGEMENT_SUPPORT_ID } from '@/components/sections/ManagementSupportSection';

const meta = {
  title: 'Sections/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HeroSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// Two columns with the pills and leader lines over the collage (xl+).
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', {
        level: 1,
        name: 'Proste zarządzanie potrzebami',
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Zgłoś organizację' }),
    ).toHaveAttribute('href', '/contact');
    await expect(
      canvas.getByRole('link', { name: /Przewiń do sekcji/ }),
    ).toHaveAttribute(
      'href',
      expect.stringMatching(`#${MANAGEMENT_SUPPORT_ID}$`),
    );
    await expect(canvas.getByRole('img')).toHaveAccessibleName(
      'Zespół pracujący przy laptopach przy wspólnym stole',
    );
  },
};

// Two columns, but the pills wrap into a row above the collage and the leader
// lines are hidden (lg, below xl).
export const NarrowDesktop: Story = {
  globals: {
    viewport: { value: '1100-900' },
  },
};

// Text above, pills as a wrapping row, collage below without leader lines.
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('link', { name: /Przewiń do sekcji/ }),
    ).not.toBeInTheDocument();
  },
};
