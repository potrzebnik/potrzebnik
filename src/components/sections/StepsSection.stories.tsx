import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StepsSection from '@/components/sections/StepsSection';

const meta = {
  title: 'Sections/StepsSection',
  component: StepsSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StepsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
