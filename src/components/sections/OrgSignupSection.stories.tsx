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

// Widok szeroki — dwie kolumny (tekst + kolaż obok siebie).
// Viewport przypięty JAWNIE (≥ 1024px), bo globalny viewport w UI jest "sticky"
// między stories i inaczej sekcja odziedziczyłaby wąski viewport z innej story.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
};

// Widok wąski — panel z tekstem na górze, pionowy stos zdjęć pod spodem (< 1024px).
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
};
