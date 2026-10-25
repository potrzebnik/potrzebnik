// @vitest-environment jsdom
import { domToForeignObjectSvg } from 'modern-screenshot';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { maskTypedValue } from './screenshot';

// jsdom without the `canvas` package returns null from `toDataURL`, which the library calls on
// start-up to probe WebP support; the cloning and SVG serialisation under test never use a canvas.
// The library also reads pseudo-element styles, which jsdom reports as unimplemented once per
// node; those reports are silenced so a real error stays visible.
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/png;base64,',
  );
  const consoleError = console.error;
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (
      String(args[0]).includes("Not implemented: Window's getComputedStyle()")
    )
      return;
    consoleError(...args);
  });
});

const TYPED = {
  email: 'jan.kowalski@example.com',
  untyped: 'secret-without-type',
  textarea: 'message-from-visitor',
  editable: 'note-in-editor',
  select: 'size-xxl',
};

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function formWithTypedValues(): HTMLElement {
  const root = document.createElement('form');
  root.innerHTML = `
    <label>E-mail <input type="email" name="email"></label>
    <input name="untyped">
    <textarea name="message"></textarea>
    <div contenteditable="true"></div>
    <select name="size">
      <option value="s">Mały</option>
      <option value="${TYPED.select}">Wariant ${TYPED.select}</option>
    </select>
    <input type="submit" value="Wyślij">
    <p>Cennik</p>`;
  document.body.append(root);
  (root.querySelector('input[name=email]') as HTMLInputElement).value =
    TYPED.email;
  (root.querySelector('input[name=untyped]') as HTMLInputElement).value =
    TYPED.untyped;
  (root.querySelector('textarea') as HTMLTextAreaElement).value =
    TYPED.textarea;
  (root.querySelector('[contenteditable]') as HTMLElement).textContent =
    TYPED.editable;
  const select = root.querySelector('select') as HTMLSelectElement;
  select.value = TYPED.select;
  // Some form libraries mark the choice with the attribute, not only the `selected` property.
  (select.selectedOptions[0] as HTMLOptionElement).defaultSelected = true;
  return root;
}

const serialize = async (root: HTMLElement, mask: boolean) =>
  new XMLSerializer().serializeToString(
    await domToForeignObjectSvg(root, {
      onCloneEachNode: mask ? maskTypedValue : null,
      font: false,
      timeout: 1000,
    }),
  );

describe('maskTypedValue against the real modern-screenshot', () => {
  it('without the mask the library carries typed values into the image', async () => {
    const svg = await serialize(formWithTypedValues(), false);
    for (const value of [
      TYPED.email,
      TYPED.untyped,
      TYPED.textarea,
      TYPED.editable,
    ]) {
      expect(svg).toContain(value);
    }
    expect(svg).toMatch(new RegExp(`<select[^>]*value="${TYPED.select}"`));
    expect(svg).toMatch(/<option[^>]*selected/);
  });

  it('with the mask the serialised SVG carries no field values and no selected option', async () => {
    const svg = await serialize(formWithTypedValues(), true);
    for (const value of [
      TYPED.email,
      TYPED.untyped,
      TYPED.textarea,
      TYPED.editable,
    ]) {
      expect(svg).not.toContain(value);
    }
    expect(svg).not.toMatch(/<select[^>]*value=/);
    expect(svg).not.toMatch(/<option[^>]*selected/);
    expect(svg).toContain('value="Wyślij"');
    expect(svg).toContain('Cennik');
  });
});
