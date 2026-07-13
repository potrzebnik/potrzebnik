import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import HelpSection from '@/components/sections/HelpSection';

const meta = {
  title: 'Sections/HelpSection',
  component: HelpSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HelpSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
