import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SectionHeading from '@/components/shared/SectionHeading';

const meta = {
  title: 'Shared/SectionHeading',
  component: SectionHeading,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    align: {
      control: 'radio',
      options: ['left', 'center'],
    },
    spacing: {
      control: 'radio',
      options: ['tight', 'loose'],
    },
  },
  args: {
    children: 'Zobacz jak możesz pomóc',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
        <div className="bg-muted h-16 rounded-lg" />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Left: Story = {};

export const Centered: Story = {
  args: {
    align: 'center',
  },
};

export const LooseSpacing: Story = {
  args: {
    align: 'center',
    spacing: 'loose',
  },
};
