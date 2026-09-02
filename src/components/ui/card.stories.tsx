import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  args: {
    className: 'w-80',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Paczki żywnościowe</CardTitle>
          <CardDescription>Fundacja Dobry Start — Wrocław</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm">
              Szczegóły
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          Zbieramy 200 paczek z produktami o długim terminie ważności dla rodzin
          objętych wsparciem świetlicy.
        </CardContent>
        <CardFooter>
          <Button>Wspieram</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Minimal: Story = {
  args: {
    children: (
      <CardContent>
        Karta z samą treścią — bez nagłówka, akcji i stopki.
      </CardContent>
    ),
  },
};
