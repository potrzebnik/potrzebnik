import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OrganizationsSection from '@/components/sections/OrganizationsSection';

const meta = {
  title: 'Sections/OrganizationsSection',
  component: OrganizationsSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OrganizationsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
