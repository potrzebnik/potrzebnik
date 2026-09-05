import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const SLIDES = [
  'Pomoc żywnościowa',
  'Środki czystości',
  'Odzież zimowa',
  'Wsparcie finansowe',
  'Wolontariat',
];

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-12">
      <Carousel
        className="w-full max-w-sm"
        aria-label="Przykładowe kategorie potrzeb"
      >
        <CarouselContent>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide}>
              <div className="bg-card text-card-foreground rounded-lg border p-6 text-center">
                {slide}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', {
      name: /Previous slide/i,
    });
    const next = canvas.getByRole('button', { name: /Next slide/i });

    // First slide on mount: going back is not possible yet.
    expect(prev).toBeDisabled();

    // One scroll forward enables the previous control.
    await userEvent.click(next);
    expect(prev).toBeEnabled();

    // Back to the first slide disables it again.
    await userEvent.click(prev);
    expect(prev).toBeDisabled();
  },
};
