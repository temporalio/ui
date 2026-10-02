import { afterEach, describe, expect, it } from 'vitest';

import { isEditableTarget } from './is-editable-target';

const keydownOn = (element: Element): KeyboardEvent => {
  let received: KeyboardEvent | undefined;
  document.body.appendChild(element);
  element.addEventListener('keydown', (event) => {
    received = event;
  });
  element.dispatchEvent(
    new KeyboardEvent('keydown', { code: 'KeyL', bubbles: true }),
  );
  if (!received) throw new Error('The keydown event was not dispatched');
  return received;
};

describe('isEditableTarget', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns true for an input', () => {
    expect(isEditableTarget(keydownOn(document.createElement('input')))).toBe(
      true,
    );
  });

  it('returns true for a textarea', () => {
    expect(
      isEditableTarget(keydownOn(document.createElement('textarea'))),
    ).toBe(true);
  });

  it('returns true for a select', () => {
    expect(isEditableTarget(keydownOn(document.createElement('select')))).toBe(
      true,
    );
  });

  it('returns true for a content editable element', () => {
    const element = document.createElement('div');
    // jsdom does not implement isContentEditable, so define it directly.
    Object.defineProperty(element, 'isContentEditable', { value: true });
    expect(isEditableTarget(keydownOn(element))).toBe(true);
  });

  it('returns false for inputs that do not take typed text', () => {
    for (const type of ['checkbox', 'radio', 'range', 'button']) {
      const input = document.createElement('input');
      input.type = type;
      expect(isEditableTarget(keydownOn(input))).toBe(false);
    }
  });

  it('returns false for other elements', () => {
    expect(isEditableTarget(keydownOn(document.createElement('div')))).toBe(
      false,
    );
    expect(isEditableTarget(keydownOn(document.createElement('button')))).toBe(
      false,
    );
  });

  it('returns false when the target is the window', () => {
    expect(isEditableTarget(new KeyboardEvent('keydown'))).toBe(false);
  });
});
