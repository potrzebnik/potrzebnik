import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StepItem from '@/components/shared/StepItem';

const meta = {
  title: 'Shared/StepItem',
  component: StepItem,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StepItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NotLast: Story = {
  args: {
    id: 1,
    title: 'Zgłoś swoją organizację',
    description:
      'Zgłoś swoją organizację – w formlarzu poprosimy o podanie NIP organizacji. Automatycznie sprawdzimy dane w KRS, aby zapewnić bezpieczeństwo Twoim darczyńcom.',
  },
};

export const Last: Story = {
  args: {
    id: 3,
    title: 'Sprawnie zarządzaj potrzebami',
    description:
      'Darczyńcy wybierają potrzeby, które chcą sfinansować i wysyłają paczki prosto pod Twój adres. Z panelu zarządzania możesz w prosty sposób monitorować co dzieje się z wystawionymi potrzebami.',
    isLast: true,
  },
};
