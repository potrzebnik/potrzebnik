import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: (
      <>
        <PopoverTrigger asChild>
          <Button variant="outline">Pozostałe potrzeby</Button>
        </PopoverTrigger>
        <PopoverContent aria-labelledby="popover-story-title">
          <PopoverHeader>
            <PopoverTitle id="popover-story-title">
              Pozostałe potrzeby
            </PopoverTitle>
            <PopoverDescription>
              Zgłoszone przez organizację w tym tygodniu.
            </PopoverDescription>
          </PopoverHeader>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">Żywność</Badge>
            <Badge variant="outline">Środki czystości</Badge>
            <Badge variant="outline">Odzież zimowa</Badge>
          </div>
        </PopoverContent>
      </>
    ),
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Closed: Story = {
  args: { defaultOpen: false },
};
