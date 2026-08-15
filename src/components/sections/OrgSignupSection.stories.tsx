import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import OrgSignupSection from '@/components/sections/OrgSignupSection';

const meta = {
  title: 'Sections/OrgSignupSection',
  component: OrgSignupSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof OrgSignupSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// Wide view — two columns (text + collage side by side).
// Viewport pinned EXPLICITLY (>= 1024px): the global viewport in the UI is
// "sticky" between stories, so otherwise this section would inherit a narrow
// viewport left over from another story.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
};

// Narrow view — stepped text panel on top, notched vertical photo stack
// below (< 1024px).
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
};
