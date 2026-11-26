import { afterEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_SHORTCUT,
  loadShortcutSetting,
  matchesShortcut,
  recordShortcut,
  saveShortcutSetting,
  shortcutLabel,
} from './keys';

const press = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

describe('shortcutLabel', () => {
  it('writes each modifier and the key', () => {
    expect(shortcutLabel(DEFAULT_SHORTCUT)).toBe('Ctrl+K');
    expect(
      shortcutLabel({
        key: 'p',
        code: 'KeyP',
        ctrl: true,
        alt: true,
        shift: true,
      }),
    ).toBe('Ctrl+Alt+Shift+P');
    expect(shortcutLabel({ key: '1', code: 'Digit1', alt: true })).toBe(
      'Alt+1',
    );
    expect(shortcutLabel({ key: 'k', code: 'KeyK', meta: true })).toBe(
      'Meta+K',
    );
  });
});

describe('matchesShortcut', () => {
  it('matches the modifier and the key', () => {
    expect(
      matchesShortcut(press({ key: 'k', ctrlKey: true }), DEFAULT_SHORTCUT),
    ).toBe(true);
    expect(matchesShortcut(press({ key: 'k' }), DEFAULT_SHORTCUT)).toBe(false);
  });

  it('needs every modifier exactly as the shortcut sets it', () => {
    const shifted = { key: 'p', code: 'KeyP', ctrl: true, shift: true };
    expect(
      matchesShortcut(
        press({ key: 'P', ctrlKey: true, shiftKey: true }),
        shifted,
      ),
    ).toBe(true);
    expect(matchesShortcut(press({ key: 'p', ctrlKey: true }), shifted)).toBe(
      false,
    );
    expect(
      matchesShortcut(
        press({ key: 'k', ctrlKey: true, altKey: true }),
        DEFAULT_SHORTCUT,
      ),
    ).toBe(false);
    expect(
      matchesShortcut(
        press({ key: 'k', ctrlKey: true, metaKey: true }),
        DEFAULT_SHORTCUT,
      ),
    ).toBe(false);
  });

  it('matches an Alt shortcut by its physical key when Alt types a symbol', () => {
    const alt = { key: 'k', code: 'KeyK', alt: true };
    expect(
      matchesShortcut(press({ key: '˚', code: 'KeyK', altKey: true }), alt),
    ).toBe(true);
    expect(
      matchesShortcut(
        press({ key: 'k', code: 'KeyK', altKey: true, ctrlKey: true }),
        alt,
      ),
    ).toBe(false);
  });

  it('matches the physical key on a non-Latin layout only', () => {
    expect(
      matchesShortcut(
        press({ key: 'л', code: 'KeyK', ctrlKey: true }),
        DEFAULT_SHORTCUT,
      ),
    ).toBe(true);
    expect(
      matchesShortcut(
        press({ key: 't', code: 'KeyK', ctrlKey: true }),
        DEFAULT_SHORTCUT,
      ),
    ).toBe(false);
  });
});

describe('recordShortcut', () => {
  it('waits while only a modifier is down', () => {
    expect(recordShortcut(press({ key: 'Control', ctrlKey: true }))).toEqual({
      kind: 'waiting',
    });
  });

  it('needs Cmd, Ctrl or Alt, and Shift alone is not enough', () => {
    expect(recordShortcut(press({ key: 'j', code: 'KeyJ' }))).toEqual({
      kind: 'needs-mod',
    });
    expect(
      recordShortcut(press({ key: 'J', code: 'KeyJ', shiftKey: true })),
    ).toEqual({ kind: 'needs-mod' });
  });

  it('needs a letter or a number', () => {
    expect(
      recordShortcut(press({ key: 'Enter', code: 'Enter', ctrlKey: true })),
    ).toEqual({ kind: 'needs-key' });
    expect(
      recordShortcut(press({ key: ' ', code: 'Space', ctrlKey: true })),
    ).toEqual({ kind: 'needs-key' });
    expect(
      recordShortcut(press({ key: '/', code: 'Slash', ctrlKey: true })),
    ).toEqual({ kind: 'needs-key' });
  });

  it('refuses keys the browser keeps with the platform modifier', () => {
    expect(
      recordShortcut(press({ key: 't', code: 'KeyT', ctrlKey: true })),
    ).toEqual({ kind: 'reserved', label: 'Ctrl+T' });
    expect(
      recordShortcut(press({ key: 't', code: 'KeyT', altKey: true })),
    ).toEqual({
      kind: 'recorded',
      shortcut: {
        key: 't',
        code: 'KeyT',
        meta: false,
        ctrl: false,
        alt: true,
        shift: false,
      },
    });
  });

  it('records the key, its code and every modifier', () => {
    expect(
      recordShortcut(
        press({ key: 'J', code: 'KeyJ', ctrlKey: true, shiftKey: true }),
      ),
    ).toEqual({
      kind: 'recorded',
      shortcut: {
        key: 'j',
        code: 'KeyJ',
        meta: false,
        ctrl: true,
        alt: false,
        shift: true,
      },
    });
  });

  it('records the physical key when Alt or Shift types a symbol', () => {
    expect(
      recordShortcut(press({ key: '˚', code: 'KeyK', altKey: true })),
    ).toMatchObject({ kind: 'recorded', shortcut: { key: 'k', alt: true } });
    expect(
      recordShortcut(
        press({ key: '!', code: 'Digit1', ctrlKey: true, shiftKey: true }),
      ),
    ).toMatchObject({
      kind: 'recorded',
      shortcut: { key: '1', ctrl: true, shift: true },
    });
  });
});

describe('shortcut setting storage', () => {
  afterEach(() => localStorage.clear());

  it('saves, loads and clears a setting', () => {
    saveShortcutSetting('test-shortcut', { key: 'j', code: 'KeyJ', alt: true });
    expect(loadShortcutSetting('test-shortcut')).toEqual({
      key: 'j',
      code: 'KeyJ',
      meta: false,
      ctrl: false,
      alt: true,
      shift: false,
    });

    saveShortcutSetting('test-shortcut', 'off');
    expect(loadShortcutSetting('test-shortcut')).toBe('off');

    saveShortcutSetting('test-shortcut', undefined);
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();
  });

  it('ignores a stored value it cannot read', () => {
    localStorage.setItem(
      'test-shortcut',
      '{"key":"j","code":"KeyJ","meta":false,"ctrl":false,"shift":true}',
    );
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();

    localStorage.setItem('test-shortcut', '{"key":" ","code":"Space"}');
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();

    localStorage.setItem('test-shortcut', '{"key":1}');
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();

    localStorage.setItem('test-shortcut', 'not json');
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();
  });
});
