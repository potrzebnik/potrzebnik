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
// Viewport przypięty JAWNIE (≥ 1024px): globalny viewport w UI jest "sticky"
// między stories, więc bez tego `Desktop` odziedziczyłby wąski viewport po
// obejrzeniu `Mobile` i pokazałby układ mobilny.
export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
};

// Widok wąski — tekst i kolaż ułożone w jednej kolumnie (< 1024px).
export const Mobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
};
