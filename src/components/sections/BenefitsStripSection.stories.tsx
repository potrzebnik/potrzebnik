import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BenefitsStripSection from '@/components/sections/BenefitsStripSection';

const meta = {
  title: 'Sections/BenefitsStripSection',
  component: BenefitsStripSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BenefitsStripSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// Viewport pinned EXPLICITLY: the global viewport in the UI is "sticky"
// between stories, so otherwise this section would inherit whatever width
// another story left behind.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
};

export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
};
