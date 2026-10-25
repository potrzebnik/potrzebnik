import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FeedbackQueuePanel } from './FeedbackQueuePanel';
import { queueEntry } from './lib/queue';

const QUEUE = [
  queueEntry({
    kind: 'text',
    note: 'Nagłówek jest za długi, skróćmy go do jednej linii.',
    pathname: '/',
    selector: 'main > h1',
    viewport: { width: 1280, height: 800 },
  }),
  queueEntry({
    kind: 'image',
    note: 'Zamienić zdjęcie na grafikę z wolontariuszami.',
    pathname: '/dla-organizacji',
    selector: '[data-testid="hero"] > div > img',
    viewport: { width: 390, height: 844 },
  }),
];

const meta = {
  title: 'Features/PageFeedback/FeedbackQueuePanel',
  component: FeedbackQueuePanel,
  args: {
    queue: QUEUE,
    token: `fb_${'a'.repeat(43)}`,
    endpoint: 'https://feedback.invalid',
    onRemove: fn(),
    onSent: fn(),
    onPick: fn(),
    onEnd: fn(),
  },
  decorators: [
    (Story) => (
      <div className="border-page-feedback-border bg-page-feedback-bg text-page-feedback-fg w-96 max-w-full rounded-lg border p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackQueuePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithNotes: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Uwagi (2)' }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: /^Usuń uwagę: Nagłówek/ }),
    );
    await expect(args.onRemove).toHaveBeenCalledWith(QUEUE[0].id);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Wskaż element' }),
    );
    await expect(args.onPick).toHaveBeenCalledTimes(1);
  },
};

export const EmptyMobile: Story = {
  args: { queue: [] },
  globals: {
    viewport: { value: '390-844' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Brak uwag. Wskaż element strony, żeby dodać pierwszą.'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Wyślij wszystkie' }),
    ).toBeDisabled();
  },
};
