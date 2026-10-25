import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FeedbackForm } from './FeedbackForm';

const meta = {
  title: 'Features/PageFeedback/FeedbackForm',
  component: FeedbackForm,
  args: {
    elementLabel: 'main > section:nth-of-type(2) > h2',
    onAdd: fn(async () => undefined),
    onCancel: fn(),
  },
  decorators: [
    (Story) => (
      <div className="border-page-feedback-border bg-page-feedback-bg text-page-feedback-fg w-96 max-w-full rounded-lg border p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Typ uwagi')).toHaveFocus();
    await userEvent.selectOptions(canvas.getByLabelText('Typ uwagi'), 'move');
    await userEvent.type(canvas.getByLabelText('Notatka'), '  Przesuń wyżej  ');
    await userEvent.click(canvas.getByRole('button', { name: 'Dodaj' }));

    await expect(args.onAdd).toHaveBeenCalledWith('move', 'Przesuń wyżej');
  },
};

export const WhitespaceNoteMobile: Story = {
  globals: {
    viewport: { value: '390-844' },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Notatka'), '   ');
    await userEvent.click(canvas.getByRole('button', { name: 'Dodaj' }));

    await expect(await canvas.findByText('Dopisz, co zmienić.')).toBeVisible();
    await expect(canvas.getByLabelText('Notatka')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(args.onAdd).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Anuluj' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
