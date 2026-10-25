import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PageFeedback } from './PageFeedback';
import { TOKEN_STORAGE_KEY } from './lib/activation';
import { parseQueue, QUEUE_STORAGE_KEY } from './lib/queue';

const TOKEN = `fb_${'s'.repeat(43)}`;
const TYPED_EMAIL = 'jan.kowalski@example.com';
// Screenshot capture gives up after 4 s, so the queue update may take that long.
const CAPTURE_WAIT = { timeout: 6000 };

function resetFeedbackStorage() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(QUEUE_STORAGE_KEY);
}

function withStoredToken() {
  resetFeedbackStorage();
  window.localStorage.setItem(TOKEN_STORAGE_KEY, TOKEN);
  return resetFeedbackStorage;
}

function storedQueue() {
  return parseQueue(window.localStorage.getItem(QUEUE_STORAGE_KEY));
}

function SamplePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Potrzebnik</h1>
      <a href="#cennik" className="underline">
        Cennik
      </a>
      <section data-testid="contact" className="flex flex-col gap-2 border p-6">
        <h2 className="text-lg font-medium">Kontakt</h2>
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input
            type="email"
            defaultValue={TYPED_EMAIL}
            className="rounded-md border px-2 py-1"
          />
        </label>
      </section>
    </div>
  );
}

const meta = {
  title: 'Features/PageFeedback',
  component: PageFeedback,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <>
      <SamplePage />
      <PageFeedback {...args} />
    </>
  ),
} satisfies Meta<typeof PageFeedback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutToken: Story = {
  beforeEach: () => {
    resetFeedbackStorage();
  },
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('heading', { name: 'Potrzebnik' });
    await expect(
      canvas.queryByRole('button', { name: /^Uwagi/ }),
    ).not.toBeInTheDocument();
  },
};

export const ActivatedFromLink: Story = {
  beforeEach: () => {
    resetFeedbackStorage();
    const original = window.location.href;
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}#uwagi=${TOKEN}&cennik`,
    );
    return () => {
      window.history.replaceState(window.history.state, '', original);
      resetFeedbackStorage();
    };
  },
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Uwagi (0)' });
    await expect(window.location.href).not.toContain(TOKEN);
    await expect(window.location.hash).toBe('#cennik');
    await expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(TOKEN);
  },
};

export const PickWithPointer: Story = {
  beforeEach: withStoredToken,
  globals: {
    viewport: { value: '1280-800' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Uwagi (0)' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Wskaż element' }),
    );
    await expect(
      canvas.getByText(/^Kliknij element, który chcesz skomentować/),
    ).toBeVisible();

    // A click inside the section's padding, so the section itself is what lies under the pointer.
    const section = canvas.getByTestId('contact');
    const { left, top } = section.getBoundingClientRect();
    section.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: left + 4,
        clientY: top + 4,
      }),
    );

    const form = await canvas.findByRole('form', { name: 'Nowa uwaga' });
    await expect(
      within(form).getByText('Element: [data-testid="contact"]'),
    ).toBeVisible();
    await userEvent.type(
      within(form).getByLabelText('Notatka'),
      'Dodać numer telefonu.',
    );
    await userEvent.click(within(form).getByRole('button', { name: 'Dodaj' }));

    await canvas.findByRole('button', { name: 'Uwagi (1)' }, CAPTURE_WAIT);
    const [entry] = storedQueue();
    await expect(entry.item).toMatchObject({
      kind: 'text',
      note: 'Dodać numer telefonu.',
      selector: '[data-testid="contact"]',
      elementText: 'Kontakt E-mail',
    });
    await expect(entry.item.screenshot).toMatch(/^data:image\/jpeg;base64,/);
    await expect(JSON.stringify(entry.item)).not.toContain(TYPED_EMAIL);
  },
};

export const PickWithKeyboardMobile: Story = {
  beforeEach: withStoredToken,
  globals: {
    viewport: { value: '390-844' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Uwagi (0)' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Wskaż element' }),
    );

    canvas.getByRole('link', { name: 'Cennik' }).focus();
    await userEvent.keyboard('{Enter}');

    const form = await canvas.findByRole('form', { name: 'Nowa uwaga' });
    await userEvent.selectOptions(
      within(form).getByLabelText('Typ uwagi'),
      'remove',
    );
    await userEvent.type(
      within(form).getByLabelText('Notatka'),
      'Usunąć ten link.',
    );
    await userEvent.click(within(form).getByRole('button', { name: 'Dodaj' }));

    await canvas.findByRole('button', { name: 'Uwagi (1)' }, CAPTURE_WAIT);
    await waitFor(() =>
      expect(storedQueue()[0]?.item).toMatchObject({
        kind: 'remove',
        elementText: 'Cennik',
      }),
    );
  },
};
