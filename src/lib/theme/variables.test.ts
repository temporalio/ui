import { describe, expect, it } from 'vitest';

import { paletteNames } from './palettes';
import { paletteCSSVariables } from './variables';

type RGBTuple = [number, number, number];

const parseRGB = (value: string): RGBTuple => {
  const channels = value.split(' ').map(Number);
  if (channels.length !== 3 || channels.some(Number.isNaN)) {
    throw new Error(`Invalid RGB token value: ${value}`);
  }

  return channels as RGBTuple;
};

const luminance = ([red, green, blue]: RGBTuple) => {
  const linear = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

const contrast = (foreground: string, background: string) => {
  const foregroundLuminance = luminance(parseRGB(foreground));
  const backgroundLuminance = luminance(parseRGB(background));
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const textPairings = [
  ['--color-text-primary', '--color-surface-background'],
  ['--color-text-primary', '--color-surface-primary'],
  ['--color-text-primary', '--color-surface-secondary'],
  ['--color-text-secondary', '--color-surface-background'],
  ['--color-text-secondary', '--color-surface-primary'],
  ['--color-text-subtle', '--color-surface-primary'],
  ['--color-text-brand', '--color-surface-primary'],
  ['--color-text-danger', '--color-surface-danger'],
  ['--color-text-information', '--color-surface-information'],
  ['--color-text-success', '--color-surface-success'],
  ['--color-text-warning', '--color-surface-warning'],
  ['--color-text-inverse', '--color-surface-inverse'],
  ['--color-text-white', '--color-interactive-surface'],
  ['--color-text-white', '--color-interactive-danger-surface'],
] as const;

const uiPairings = [
  ['--color-border-primary', '--color-surface-primary'],
  ['--color-border-focus-info', '--color-surface-primary'],
  ['--color-border-focus-danger', '--color-surface-primary'],
  ['--color-workflow-relationship-connector', '--color-surface-primary'],
] as const;

describe('palette semantic color contract', () => {
  it('defines the same complete token set for every palette and mode', () => {
    const expectedTokens = Object.keys(
      paletteCSSVariables.precision.light,
    ).sort();

    for (const palette of paletteNames) {
      expect(Object.keys(paletteCSSVariables[palette].light).sort()).toEqual(
        expectedTokens,
      );
      expect(Object.keys(paletteCSSVariables[palette].dark).sort()).toEqual(
        expectedTokens,
      );
    }
  });

  it('keeps required text pairings at WCAG AA contrast', () => {
    for (const palette of paletteNames) {
      for (const scheme of ['light', 'dark'] as const) {
        const tokens = paletteCSSVariables[palette][scheme];

        for (const [foreground, background] of textPairings) {
          expect(
            contrast(tokens[foreground], tokens[background]),
            `${palette}/${scheme}: ${foreground} on ${background}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('keeps focus, control, and graph indicators at non-text contrast', () => {
    for (const palette of paletteNames) {
      for (const scheme of ['light', 'dark'] as const) {
        const tokens = paletteCSSVariables[palette][scheme];

        for (const [foreground, background] of uiPairings) {
          expect(
            contrast(tokens[foreground], tokens[background]),
            `${palette}/${scheme}: ${foreground} on ${background}`,
          ).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});
