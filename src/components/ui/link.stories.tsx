import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Link } from '@/components/ui/link';

const meta = {
  title: 'UI/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'footerNav', 'footerLegal'],
    },
  },
  args: {
    href: '#',
    children: 'Link',
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FooterNav: Story = {
  args: {
    variant: 'footerNav',
    children: 'O nas',
  },
};

export const FooterLegal: Story = {
  args: {
    variant: 'footerLegal',
    children: 'Polityka prywatności',
  },
};
