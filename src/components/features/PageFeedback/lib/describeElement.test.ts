// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { FEEDBACK_SELECTOR_MAX, FeedbackItemSchema } from './contract';
import {
  buildSelector,
  describePickedElement,
  readElementText,
} from './describeElement';
import { FEEDBACK_UI_ATTRIBUTE } from './uiAttribute';

beforeEach(() => {
  document.body.innerHTML = '';
});

function pick(selector: string): Element {
  const element = document.querySelector(selector);
  if (element === null) throw new Error(`missing ${selector}`);
  return element;
}

describe('buildSelector', () => {
  it('a unique id wins', () => {
    document.body.innerHTML = `<main><h1 id="heading">Hej</h1></main>`;

    expect(buildSelector(pick('h1'))).toBe('#heading');
  });

  it('an id with characters outside a CSS identifier becomes an attribute selector', () => {
    document.body.innerHTML = `<p id="1:r0:">x</p>`;
    const selector = buildSelector(pick('p'));

    expect(selector).toBe('[id="1:r0:"]');
    expect(document.querySelector(selector)).toBe(pick('p'));
  });

  it('duplicated ids and data-testid do not anchor — the nth-of-type path is used', () => {
    document.body.innerHTML = `
      <ul><li data-testid="row">a</li><li data-testid="row" id="d">b</li><li id="d">c</li></ul>`;
    const second = document.querySelectorAll('li')[1];
    const selector = buildSelector(second);

    expect(selector).toBe('body > ul > li:nth-of-type(2)');
    expect(document.querySelector(selector)).toBe(second);
  });

  it('anchors on the nearest ancestor with a unique data-testid', () => {
    document.body.innerHTML = `<section data-testid="cennik"><div><p>1</p><p>2</p></div></section>`;
    const selector = buildSelector(document.querySelectorAll('p')[1]);

    expect(selector).toBe('[data-testid="cennik"] > div > p:nth-of-type(2)');
  });

  it('ignores data-fb, which this widget does not map to source files', () => {
    document.body.innerHTML = `<div><p data-fb="0123456789">1</p><p>2</p></div>`;

    expect(buildSelector(pick('p'))).toBe('body > div > p:nth-of-type(1)');
  });

  it('never exceeds the contract limit, even for a very deep tree', () => {
    document.body.innerHTML = `${'<div><span></span>'.repeat(300)}${'</div>'.repeat(300)}`;
    const deepest = document.querySelectorAll('div')[299];
    const selector = buildSelector(deepest);

    expect(selector.length).toBeLessThanOrEqual(FEEDBACK_SELECTOR_MAX);
    expect(selector.endsWith('div')).toBe(true);
  });
});

describe('readElementText', () => {
  it('never collects a password, a textarea value or a select choice', () => {
    document.body.innerHTML = `
      <form><label>Hasło <input type="password"></label>
      <textarea>my message</textarea><select><option>secret-option</option></select>
      <div contenteditable="true">typed</div><button>Zaloguj</button></form>`;
    (pick('input') as HTMLInputElement).value = 'secret123';
    (pick('textarea') as HTMLTextAreaElement).value = 'secret-textarea';
    const text = readElementText(pick('form')) ?? '';

    expect(text).toBe('Hasło Zaloguj');
    for (const leaked of [
      'secret123',
      'secret-textarea',
      'my message',
      'secret-option',
      'typed',
    ]) {
      expect(text).not.toContain(leaked);
    }
    expect(readElementText(pick('input'))).toBeUndefined();
  });

  it('skips the widget overlay, collapses whitespace and trims to the limit', () => {
    document.body.innerHTML = `<div><p>  Ala   ma\n kota </p><span ${FEEDBACK_UI_ATTRIBUTE}>Uwagi (2)</span><p>${'x'.repeat(900)}</p></div>`;
    const text = readElementText(pick('div')) ?? '';

    expect(text.startsWith('Ala ma kota x')).toBe(true);
    expect(text).not.toContain('Uwagi');
    expect(text.length).toBe(500);
  });
});

describe('describePickedElement', () => {
  it('produces a payload that passes the contract, without sourceId or buildSha', () => {
    document.body.innerHTML = `<section data-fb="abcdef0123"><button>Kup</button></section>`;
    const picked = describePickedElement(pick('button'), {
      pathname: '/oferta',
      viewport: { width: 1280.4, height: 0 },
    });

    expect(picked).toMatchObject({ pathname: '/oferta', elementText: 'Kup' });
    expect(picked).not.toHaveProperty('sourceId');
    expect(picked).not.toHaveProperty('buildSha');
    expect(picked.viewport).toEqual({ width: 1280, height: 1 });
    expect(
      FeedbackItemSchema.safeParse({ ...picked, kind: 'text', note: 'zmień' })
        .success,
    ).toBe(true);
  });

  it('prefixes a pathname without a leading slash', () => {
    document.body.innerHTML = '<p>tekst</p>';
    const picked = describePickedElement(pick('p'), {
      pathname: 'oferta',
      viewport: { width: 10, height: 10 },
    });

    expect(picked.pathname).toBe('/oferta');
  });
});
