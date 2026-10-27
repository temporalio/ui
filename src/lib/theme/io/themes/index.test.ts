import path from 'node:path';

import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { ioThemeToCssVariables, themes, toCssVariables } from './index';

const registeredThemes = Object.entries(themes);

describe('registered IO themes', () => {
  it.each(registeredThemes)('%s exposes page-margin spacing', (_, theme) => {
    expect(ioThemeToCssVariables(theme)['--spacing-page-margin']).toBe(
      '2.5rem',
    );
  });

  it('generates semantic spacing utilities without replacing numeric spacing', async () => {
    const result = await postcss([tailwindcss()]).process(
      `@import 'tailwindcss' source(none);
       @config '../tailwind.config.ts';
       @source inline("px-page-margin mx-page-margin gap-page-margin gap-io-lg p-4 max-w-lg");`,
      { from: path.resolve('src/app.css') },
    );

    expect(result.css).toContain('.px-page-margin');
    expect(result.css).toContain('padding-inline: var(--spacing-page-margin)');
    expect(result.css).toContain('margin-inline: var(--spacing-page-margin)');
    expect(result.css).toContain('gap: var(--spacing-page-margin)');
    expect(result.css).toContain('gap: var(--spacing-lg)');
    expect(result.css).toContain('padding: calc(var(--spacing) * 4)');

    const maxWidthValues: string[] = [];
    result.root.walkRules('.max-w-lg', (rule) => {
      rule.walkDecls('max-width', ({ value }) => maxWidthValues.push(value));
    });
    expect(maxWidthValues.at(-1)).toBe('var(--container-lg)');
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
