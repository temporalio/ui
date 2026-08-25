import { describe, expect, it } from 'vitest';

import { colorAlphaScales } from './color-alpha-scales';
import { colorScales } from './color-scales';
import { semanticColors } from './semantic-colors';

const OPAQUE_HEX_COLOR = /^#[0-9a-f]{6}$/i;

describe('semantic surface colors', () => {
  it('matches representative Figma colors', () => {
    expect(semanticColors.surface.primary).toEqual({
      light: colorScales.slate[1],
      dark: colorScales.neutral[11],
    });
    expect(semanticColors.surface.secondary).toEqual({
      light: colorScales.slate[2],
      dark: colorScales.neutral[10],
    });
    expect(semanticColors.surface.tertiary).toEqual({
      light: colorScales.slate[3],
      dark: colorScales.neutral[9],
    });
    expect(semanticColors.surface.information).toEqual({
      light: colorScales.blue[4],
      dark: colorScales.blue[12],
    });

    expect(semanticColors.content.error).toEqual({
      light: colorScales.persimmon[12],
      dark: colorScales.persimmon[8],
    });
    expect({
      'text-info': semanticColors.content['static-text-info'],
      'text-success': semanticColors.content['static-text-success'],
      'text-warning': semanticColors.content['static-text-warning'],
      'text-danger': semanticColors.content['static-text-danger'],
    }).toEqual({
      'text-info': {
        light: colorScales.blue[11],
        dark: colorScales.blue[9],
      },
      'text-success': {
        light: colorScales.green[11],
        dark: colorScales.green[9],
      },
      'text-warning': {
        light: colorScales.amber[11],
        dark: colorScales.amber[9],
      },
      'text-danger': {
        light: colorScales.red[11],
        dark: colorScales.red[9],
      },
    });
    expect(semanticColors.surface['static-neutral']).toEqual({
      light: colorScales.neutral[7],
      dark: colorScales.neutral[7],
    });
  });
});

describe('interactive semantic colors', () => {
  it('matches the Figma interactive tokens', () => {
    expect(semanticColors.interactive).toEqual({
      primary: {
        light: colorScales.indigo[9],
        dark: colorScales.indigo[11],
      },
      'primary-hover': {
        light: colorScales.indigo[10],
        dark: colorScales.indigo[10],
      },
      'primary-press': {
        light: colorScales.indigo[11],
        dark: colorScales.indigo[9],
      },
      secondary: {
        light: '#f8f8f8',
        dark: '#121212',
      },
      'secondary-hover': {
        light: colorAlphaScales.indigo[10],
        dark: colorAlphaScales.indigo[10],
      },
      'secondary-press': {
        light: colorAlphaScales.indigo[15],
        dark: colorAlphaScales.indigo[20],
      },
      'tertiary-press': {
        light: colorAlphaScales.neutral[10],
        dark: colorAlphaScales.slate[20],
      },
      'tertiary-hover': {
        light: colorAlphaScales.neutral[5],
        dark: colorAlphaScales.slate[10],
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
    const replacementFills = [
      ...Object.values(semanticColors.surface),
      semanticColors.interactive.primary,
      semanticColors.interactive['primary-hover'],
      semanticColors.interactive['primary-press'],
      semanticColors.interactive.secondary,
      semanticColors.interactive.danger,
      semanticColors.interactive['danger-hover'],
      semanticColors.interactive['danger-press'],
    ];

    for (const color of replacementFills) {
      expect(color.light).toMatch(OPAQUE_HEX_COLOR);
      expect(color.dark).toMatch(OPAQUE_HEX_COLOR);
    }
  });

  it('preserves translucency for alpha interactions and overlays', () => {
    const alphaColors = [
      semanticColors.interactive['secondary-hover'],
      semanticColors.interactive['secondary-press'],
      semanticColors.interactive['tertiary-hover'],
      semanticColors.interactive['tertiary-press'],
      ...Object.values(semanticColors.overlay),
    ];

    for (const color of alphaColors) {
      expect(color.light).toContain('color-mix');
      expect(color.dark).toContain('color-mix');
    }
  });
});

describe('Figma alpha overlay colors', () => {
  it('uses the theme-specific overlay strengths', () => {
    expect(semanticColors.overlay.primary).toEqual({
      light: colorAlphaScales.neutral[5],
      dark: colorAlphaScales.slate[5],
    });
    expect(semanticColors.overlay.secondary).toEqual({
      light: colorAlphaScales.neutral[10],
      dark: colorAlphaScales.slate[10],
    });
    expect(semanticColors.overlay.tertiary).toEqual({
      light: colorAlphaScales.neutral[15],
      dark: colorAlphaScales.slate[15],
    });
    expect(semanticColors.overlay.warning).toEqual({
      light: colorAlphaScales.amber[20],
      dark: colorAlphaScales.amber[15],
    });
  });
});

describe('action semantic colors', () => {
  it('matches the general Figma action overlays', () => {
    expect(semanticColors.actions).toEqual({
      'hover-overlay': {
        light: colorAlphaScales.neutral[10],
        dark: colorAlphaScales.slate[15],
      },
      'press-overlay': {
        light: colorAlphaScales.neutral[15],
        dark: colorAlphaScales.slate[20],
      },
      'brand-hover': {
        light: colorAlphaScales.indigo[10],
        dark: colorAlphaScales.indigo[5],
      },
      'brand-press': {
        light: colorAlphaScales.indigo[15],
        dark: colorAlphaScales.indigo[20],
      },
    });
  });
});
