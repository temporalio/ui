import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { describe, expect, it } from 'vitest';

import { ioThemeToCssVariables, themes, toCssVariables } from './index';
import temporal from '../../plugin';

const registeredThemes = Object.entries(themes);

describe('registered IO themes', () => {
  it.each(registeredThemes)('%s exposes page-margin spacing', (_, theme) => {
    expect(ioThemeToCssVariables(theme)['--spacing-page-margin']).toBe(
      '2.5rem',
    );
  });

  it('generates semantic spacing utilities without replacing numeric spacing', async () => {
    const result = await postcss([
      tailwindcss({
        content: [{ raw: 'px-page-margin mx-page-margin gap-page-margin p-4' }],
        plugins: [temporal],
      }),
    ]).process('@tailwind utilities;', { from: undefined });

    expect(result.css).toContain('.px-page-margin');
    expect(result.css).toContain('padding-left: var(--spacing-page-margin)');
    expect(result.css).toContain('padding-right: var(--spacing-page-margin)');
    expect(result.css).toContain('margin-left: var(--spacing-page-margin)');
    expect(result.css).toContain('gap: var(--spacing-page-margin)');
    expect(result.css).toContain('padding: 1rem');
  });
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
