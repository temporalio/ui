import { describe, expect, it } from 'vitest';

import { themes, toCssVariables } from './index';

const registeredThemes = Object.entries(themes);

describe('registered IO themes', () => {
  it('light and dark themes expose the same color variables', () => {
    expect(
      Object.keys(toCssVariables(themes.light.color, 'color')).sort(),
    ).toEqual(Object.keys(toCssVariables(themes.dark.color, 'color')).sort());
  });

  it.each(registeredThemes)(
    '%s keeps tertiary interactions transparent',
    (_, theme) => {
      const variables = toCssVariables(theme.color, 'color');

      expect(variables['--color-interactive-tertiary']).toBe('transparent');
    },
  );
});
