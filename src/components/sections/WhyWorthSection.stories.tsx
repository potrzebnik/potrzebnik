import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WhyWorthSection from '@/components/sections/WhyWorthSection';

const meta = {
  title: 'Sections/WhyWorthSection',
  component: WhyWorthSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WhyWorthSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
