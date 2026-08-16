import { get } from 'svelte/store';

import { beforeEach, describe, expect, it } from 'vitest';

import { defaultPalette } from '$lib/theme/palettes';

import { palette, palettePreferenceKey, usePalettePreference } from './palette';

describe('palette utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.palette = defaultPalette;
    document.body.dataset.palette = defaultPalette;
    usePalettePreference.set(defaultPalette);
  });

  it('persists the selected palette', () => {
    usePalettePreference.set('ember');

    expect(get(usePalettePreference)).toBe('ember');
    expect(window.localStorage.getItem(palettePreferenceKey)).toBe('"ember"');
  });

  it('applies the selected palette to the application roots', () => {
    const node = document.createElement('div');
    const action = palette(node);

    usePalettePreference.set('ember');

    expect(node.dataset.palette).toBe('ember');
    expect(document.documentElement.dataset.palette).toBe('ember');
    expect(document.body.dataset.palette).toBe('ember');

    action.destroy();
  });

  it('repairs an unsupported palette value', () => {
    const node = document.createElement('div');
    usePalettePreference.set('unsupported' as never);

    const action = palette(node);

    expect(get(usePalettePreference)).toBe(defaultPalette);
    expect(node.dataset.palette).toBe(defaultPalette);
    expect(window.localStorage.getItem(palettePreferenceKey)).toBe(
      `"${defaultPalette}"`,
    );

    action.destroy();
  });
});
