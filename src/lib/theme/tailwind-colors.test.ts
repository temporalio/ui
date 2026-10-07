import { describe, expect, it } from 'vitest';

import { colorTheme } from './tailwind-colors';

describe('Tailwind color theme', () => {
  it('exposes flat action colors for backgrounds and borders', () => {
    const actions = {
      workflow: 'var(--color-action-workflow)',
      'workflow-overlay': 'var(--color-action-workflow-overlay)',
    };

    expect(colorTheme.backgroundColor.action).toMatchObject(actions);
    expect(colorTheme.borderColor.action).toMatchObject(actions);
  });

  it.each([
    { name: 'accent', colors: colorTheme.accentColor },
    { name: 'background', colors: colorTheme.backgroundColor },
    { name: 'border', colors: colorTheme.borderColor },
    { name: 'shadow', colors: colorTheme.boxShadowColor },
    { name: 'caret', colors: colorTheme.caretColor },
    { name: 'fill', colors: colorTheme.fill },
    { name: 'gradient', colors: colorTheme.gradientColorStops },
    { name: 'stroke', colors: colorTheme.stroke },
    { name: 'text', colors: colorTheme.textColor },
    { name: 'decoration', colors: colorTheme.textDecorationColor },
  ])('exposes extension colors for $name utilities', ({ colors }) => {
    expect(colors.extension).toEqual({
      info: 'var(--color-extension-info)',
      success: 'var(--color-extension-success)',
      warning: 'var(--color-extension-warning)',
      danger: 'var(--color-extension-danger)',
    });
  });

  it('uses the primary border token as the default border color', () => {
    expect(colorTheme.borderColor.DEFAULT).toBe('var(--color-border-primary)');
  });
});
