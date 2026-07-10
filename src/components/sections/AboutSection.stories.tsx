import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutSection from '@/components/sections/AboutSection';

const meta = {
  title: 'Sections/AboutSection',
  component: AboutSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
