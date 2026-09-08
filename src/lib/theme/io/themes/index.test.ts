import { describe, expect, it } from 'vitest';

import {
  colorAlphaScales,
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

  it.each(registeredThemes)('%s has 80 color variables', (_, theme) => {
    const variables = toCssVariables(theme.color, 'color');

    expect(Object.keys(variables)).toHaveLength(80);
  });

  it.each(registeredThemes)(
    '%s defines workflow action hover colors at 80 percent opacity',
    (_, theme) => {
      const variables = toCssVariables(theme.color, 'color');

      expect(variables).toMatchObject({
        '--color-action-workflow-workflow-hover': colorAlphaScales.zaffre[80],
        '--color-action-workflow-activity-hover':
          colorAlphaScales['dark-magenta'][80],
        '--color-action-workflow-signal-hover': colorAlphaScales.persimmon[80],
        '--color-action-workflow-timer-hover': colorAlphaScales.pink[80],
        '--color-action-workflow-nexus-hover':
          colorAlphaScales['peacock-blue'][80],
      });
    },
  );
});
