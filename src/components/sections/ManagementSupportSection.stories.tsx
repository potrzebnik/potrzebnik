import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import ManagementSupportSection, {
  MANAGEMENT_SUPPORT_ID,
} from '@/components/sections/ManagementSupportSection';

const meta = {
  title: 'Sections/ManagementSupportSection',
  component: ManagementSupportSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ManagementSupportSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// Text on the stepped, outlined band; the photo rises above its step.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelector(`section#${MANAGEMENT_SUPPORT_ID}`),
    ).not.toBeNull();
    await expect(
      canvas.getByRole('heading', {
        level: 2,
        name: 'Wsparcie w zarządzaniu potrzebami',
      }),
    ).toBeVisible();
    await expect(
      canvas.getByText('organizacji pożytku publicznego').tagName,
    ).toBe('STRONG');
    await expect(canvas.getByRole('img')).toHaveAccessibleName(
      'Wolontariusze pakują kartony z pomocą i ładują je do busa',
    );
  },
};

// Text runs taller than the photo, so the band grows with the text.
export const NarrowDesktop: Story = {
  globals: {
    viewport: { value: '1100-900' },
  },
};

// Text above the photo; the band fills the whole section.
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
};
