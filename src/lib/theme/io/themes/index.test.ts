import { describe, expect, it } from 'vitest';

import { defaultThemeName, themes, toCssVariables } from './index';

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

  it.each(registeredThemes)('%s has 75 color variables', (_, theme) => {
    const variables = toCssVariables(theme.color, 'color');

    expect(Object.keys(variables)).toHaveLength(75);
  });
});
