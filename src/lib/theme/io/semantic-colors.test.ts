import { describe, expect, it } from 'vitest';

import { colorAlphaScales } from './color-alpha-scales';
import { colorScales } from './color-scales';
import { compositeColor } from './composite-color';
import { semanticColors } from './semantic-colors';

const OPAQUE_HEX_COLOR = /^#[0-9a-f]{6}$/i;

describe('color compositing', () => {
  it('precomposites a foreground color over an opaque background', () => {
    expect(compositeColor('#000000', 50, '#ffffff')).toBe('#808080');
  });
});

describe('precomposited semantic colors', () => {
  it('matches representative final Figma colors', () => {
    expect(semanticColors.surface.primary).toEqual({
      light: '#f4f4f3',
      dark: '#22211f',
    });
    expect(semanticColors.surface.status.blue).toEqual({
      light: '#cfe5f5',
      dark: '#1d3241',
    });
    expect(semanticColors.interactive['primary-press'].dark).toBe('#4d61ab');
  });
});

describe('interactive semantic colors', () => {
  it('matches the Figma interactive tokens', () => {
    expect(semanticColors.interactive).toEqual({
      primary: {
        light: colorScales.indigo[9],
        dark: colorScales.indigo[10],
      },
      'primary-hover': {
        light: colorScales.indigo[10],
        dark: colorScales.indigo[9],
      },
      'primary-press': {
        light: colorScales.indigo[11],
        dark: '#4d61ab',
      },
      secondary: {
        light: colorScales.slate[1],
        dark: colorScales.slate[12],
      },
      'secondary-hover': {
        light: '#e8ecf7',
        dark: '#202125',
      },
      'secondary-press': {
        light: '#dfe4f6',
        dark: '#242b42',
      },
      danger: {
        light: colorScales.red[9],
        dark: colorScales.red[11],
      },
      'danger-hover': {
        light: colorScales.red[10],
        dark: colorScales.red[10],
      },
      'danger-press': {
        light: colorScales.red[11],
        dark: colorScales.red[9],
      },
    });
  });
});

describe('semantic color opacity', () => {
  it('uses opaque values for replacement fills', () => {
    const { status, ...surfaceColors } = semanticColors.surface;
    const replacementFills = [
      ...Object.values(surfaceColors),
      ...Object.values(status),
      ...Object.values(semanticColors.interactive),
    ];

    for (const color of replacementFills) {
      expect(color.light).toMatch(OPAQUE_HEX_COLOR);
      expect(color.dark).toMatch(OPAQUE_HEX_COLOR);
    }
  });

  it('preserves translucency for compositing tokens', () => {
    const compositingColors = [
      ...Object.values(semanticColors.border),
      ...Object.values(semanticColors.actions),
      ...Object.values(semanticColors.overlay),
    ];

    for (const color of compositingColors) {
      expect(color.light).toContain('color-mix');
      expect(color.dark).toContain('color-mix');
    }
  });
});

describe('action semantic colors', () => {
  it('matches the general Figma action overlays', () => {
    expect(semanticColors.actions).toEqual({
      'hover-overlay': {
        light: colorAlphaScales.neutral[10],
        dark: `color-mix(in srgb, ${colorScales.neutral[4]} 15%, transparent)`,
      },
      'press-overlay': {
        light: colorAlphaScales.neutral[15],
        dark: `color-mix(in srgb, ${colorScales.neutral[4]} 20%, transparent)`,
      },
      'brand-hover': {
        light: colorAlphaScales.indigo[30],
        dark: colorAlphaScales.indigo[30],
      },
    });
  });
});
