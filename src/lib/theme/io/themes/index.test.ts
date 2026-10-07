import { describe, expect, it } from 'vitest';

import {
  colorAlphaScales,
  colorScales,
  defaultThemeName,
  themes,
  toCssVariables,
} from './index';

const registeredThemes = Object.entries(themes);
const colorContract = Object.keys(
  toCssVariables(themes[defaultThemeName].color, 'color'),
).sort();

describe('registered IO themes', () => {
  it.each(registeredThemes)('%s has the exact color contract', (_, theme) => {
    const variableNames = Object.keys(
      toCssVariables(theme.color, 'color'),
    ).sort();

    expect(variableNames).toEqual(colorContract);
  });

  it.each(registeredThemes)('%s has 83 color variables', (_, theme) => {
    const variables = toCssVariables(theme.color, 'color');

    expect(Object.keys(variables)).toHaveLength(83);
    expect(variables['--color-action-update']).toBe('#ffba18');
    expect(variables['--color-interactive-tertiary']).toBe(
      theme.color.surface.primary,
    );
  });

  it.each(registeredThemes)(
    '%s defines action overlays with the exported theme opacity',
    (name, theme) => {
      const variables = toCssVariables(theme.color, 'color');
      const opacity = name === 'dark' ? 50 : 20;

      expect(variables).toMatchObject({
        '--color-action-workflow-overlay': colorAlphaScales.zaffre[opacity],
        '--color-action-activity-overlay':
          colorAlphaScales['dark-magenta'][opacity],
        '--color-action-signal-overlay': colorAlphaScales.persimmon[opacity],
        '--color-action-timer-overlay': `color-mix(in srgb, ${colorScales.pink[11]} ${opacity}%, transparent)`,
        '--color-action-nexus-overlay':
          colorAlphaScales['peacock-blue'][opacity],
      });
    },
  );
});
