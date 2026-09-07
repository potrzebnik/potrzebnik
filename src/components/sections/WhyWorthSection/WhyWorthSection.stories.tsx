import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import WhyWorthSection from './WhyWorthSection';

const meta = {
  title: 'Sections/WhyWorthSection',
  component: WhyWorthSection,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: {
      value: '1280-800',
    },
  },
} satisfies Meta<typeof WhyWorthSection>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Desktop: Story = {};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: '390-844',
    },
  },
};
