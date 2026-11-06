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
  it('writes the modifier, Alt, Shift and the key', () => {
    expect(shortcutLabel(DEFAULT_SHORTCUT)).toBe('Ctrl+K');
    expect(
      shortcutLabel({ key: 'p', code: 'KeyP', shift: true, alt: true }),
    ).toBe('Ctrl+Alt+Shift+P');
    expect(shortcutLabel({ key: ' ', code: 'Space' })).toBe('Ctrl+Space');
  });
});

describe('matchesShortcut', () => {
  it('matches the modifier and the key', () => {
    expect(
      matchesShortcut(press({ key: 'k', ctrlKey: true }), DEFAULT_SHORTCUT),
    ).toBe(true);
    expect(matchesShortcut(press({ key: 'k' }), DEFAULT_SHORTCUT)).toBe(false);
  });

  it('needs Shift and Alt exactly as the shortcut sets them', () => {
    const shifted = { key: 'p', code: 'KeyP', shift: true };
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

  it('needs the modifier', () => {
    expect(recordShortcut(press({ key: 'j', code: 'KeyJ' }))).toEqual({
      kind: 'needs-mod',
    });
  });

  it('refuses keys the browser or the palette keeps', () => {
    expect(
      recordShortcut(press({ key: 't', code: 'KeyT', ctrlKey: true })),
    ).toEqual({ kind: 'reserved', label: 'Ctrl+T' });
    expect(
      recordShortcut(press({ key: 'Enter', code: 'Enter', ctrlKey: true })),
    ).toEqual({ kind: 'reserved', label: 'Ctrl+Enter' });
  });

  it('records the key, its code and the modifiers', () => {
    expect(
      recordShortcut(
        press({ key: 'J', code: 'KeyJ', ctrlKey: true, shiftKey: true }),
      ),
    ).toEqual({
      kind: 'recorded',
      shortcut: { key: 'j', code: 'KeyJ', shift: true, alt: false },
    });
  });
});

describe('shortcut setting storage', () => {
  afterEach(() => localStorage.clear());

  it('saves, loads and clears a setting', () => {
    saveShortcutSetting('test-shortcut', { key: 'j', code: 'KeyJ' });
    expect(loadShortcutSetting('test-shortcut')).toEqual({
      key: 'j',
      code: 'KeyJ',
    });

    saveShortcutSetting('test-shortcut', 'off');
    expect(loadShortcutSetting('test-shortcut')).toBe('off');

    saveShortcutSetting('test-shortcut', undefined);
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();
  });

  it('ignores a stored value it cannot read', () => {
    localStorage.setItem('test-shortcut', '{"key":1}');
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();

    localStorage.setItem('test-shortcut', 'not json');
    expect(loadShortcutSetting('test-shortcut')).toBeUndefined();
  });
});
