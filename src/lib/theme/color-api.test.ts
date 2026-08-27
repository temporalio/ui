import { describe, expect, it } from 'vitest';

import {
  colorTheme,
  darkSemanticColorVariables,
  lightSemanticColorVariables,
} from './color-api';
import { colorAlphaScales } from './io/color-alpha-scales';
import { colorScales } from './io/color-scales';

describe('accent semantic colors', () => {
  it('generates the light theme variables', () => {
    expect(lightSemanticColorVariables).toMatchObject({
      '--color-content-accent': colorScales.purple[12],
      '--color-surface-accent': colorScales.purple[5],
      '--color-border-accent': colorAlphaScales.purple[80],
      '--color-overlay-accent': colorAlphaScales.purple[20],
    });
  });

  it('generates the dark theme variables', () => {
    expect(darkSemanticColorVariables).toMatchObject({
      '--color-content-accent': colorScales.purple[8],
      '--color-surface-accent': colorScales.purple[12],
      '--color-border-accent': colorAlphaScales.purple[80],
      '--color-overlay-accent': colorAlphaScales.purple[20],
    });
  });

  it('exposes accent colors through property-aware theme groups', () => {
    expect(colorTheme.backgroundColor.surface.accent).toBe(
      'var(--color-surface-accent)',
    );
    expect(colorTheme.backgroundColor.overlay.accent).toBe(
      'var(--color-overlay-accent)',
    );
    expect(colorTheme.borderColor).toMatchObject({
      accent: 'var(--color-border-accent)',
    });
    expect(colorTheme.textColor).toMatchObject({
      accent: 'var(--color-content-accent)',
    });
  });
});
