import { describe, expect, it } from 'vitest';

import { colorAlphaScales } from './color-alpha-scales';
import { colorScales } from './color-scales';
import { semanticColors } from './semantic-colors';

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
        dark: colorAlphaScales.slate[40],
      },
      secondary: {
        light: colorScales.slate[1],
        dark: colorScales.slate[12],
      },
      'secondary-hover': {
        light: colorAlphaScales.indigo[10],
        dark: colorAlphaScales.indigo[5],
      },
      'secondary-press': {
        light: colorAlphaScales.indigo[15],
        dark: colorAlphaScales.indigo[20],
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
