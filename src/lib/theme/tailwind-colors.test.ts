import { describe, expect, it } from 'vitest';

import { colorTheme } from './tailwind-colors';

describe('Tailwind color theme', () => {
  it('exposes flat action colors for backgrounds and borders', () => {
    const actions = {
      workflow: 'var(--color-action-workflow)',
      'workflow-overlay': 'var(--color-action-workflow-overlay)',
      activity: 'var(--color-action-activity)',
      'activity-overlay': 'var(--color-action-activity-overlay)',
      signal: 'var(--color-action-signal)',
      'signal-overlay': 'var(--color-action-signal-overlay)',
      timer: 'var(--color-action-timer)',
      'timer-overlay': 'var(--color-action-timer-overlay)',
      nexus: 'var(--color-action-nexus)',
      'nexus-overlay': 'var(--color-action-nexus-overlay)',
      query: 'var(--color-action-query)',
      update: 'var(--color-action-update)',
      capacity: 'var(--color-action-capacity)',
      fairness: 'var(--color-action-fairness)',
    };

    expect(colorTheme.backgroundColor.action).toEqual(actions);
    expect(colorTheme.borderColor.action).toEqual(actions);
  });
  it.each([
    colorTheme.accentColor,
    colorTheme.backgroundColor,
    colorTheme.borderColor,
    colorTheme.boxShadowColor,
    colorTheme.caretColor,
    colorTheme.fill,
    colorTheme.gradientColorStops,
    colorTheme.stroke,
    colorTheme.textColor,
    colorTheme.textDecorationColor,
  ])('exposes extension colors through supported utilities', (colors) => {
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
