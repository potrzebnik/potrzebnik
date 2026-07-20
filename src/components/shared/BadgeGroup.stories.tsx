import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BadgeGroup from '@/components/shared/BadgeGroup';
import { BADGES } from '@/lib/constants';

const meta = {
  title: 'Shared/BadgeGroup',
  component: BadgeGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    charLimit: {
      control: 'number',
    },
  },
} satisfies Meta<typeof BadgeGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleBadge: Story = {
  args: {
    badges: [BADGES.URGENT],
  },
};

export const MultipleBadges: Story = {
  args: {
    badges: [BADGES.URGENT, BADGES.NEW, BADGES.ONGOING],
  },
};

export const OverflowBadges: Story = {
  args: {
    badges: [
      BADGES.URGENT,
      BADGES.EXPIRING,
      BADGES.NEW,
      BADGES.ONGOING,
      BADGES.URGENT,
      BADGES.EXPIRING,
    ],
  },
};

export const LongLabels: Story = {
  args: {
    badges: [
      { id: 10, label: 'Bardzo pilna sprawa' },
      { id: 11, label: 'Wymaga natychmiastowej uwagi' },
      BADGES.NEW,
    ],
    charLimit: 30,
  },
};

export const Empty: Story = {
  args: {
    badges: [],
  },
};
