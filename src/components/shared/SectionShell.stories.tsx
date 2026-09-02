import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SectionShell from '@/components/shared/SectionShell';

const meta = {
  title: 'Shared/SectionShell',
  component: SectionShell,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['contained', 'bleed'],
    },
    rhythm: {
      control: 'radio',
      options: ['default', 'compact'],
    },
  },
  args: {
    children: (
      <div className="bg-muted text-muted-foreground rounded-lg p-8 text-center">
        Zawartość sekcji
      </div>
    ),
  },
} satisfies Meta<typeof SectionShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Contained: Story = {
  args: {
    variant: 'contained',
  },
};

export const Bleed: Story = {
  args: {
    variant: 'bleed',
  },
};

export const CompactRhythm: Story = {
  args: {
    variant: 'contained',
    rhythm: 'compact',
  },
};
