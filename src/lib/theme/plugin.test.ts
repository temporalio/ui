import path from 'node:path';

import tailwindcss from '@tailwindcss/postcss';
import postcss, { type Root } from 'postcss';
import { describe, expect, it } from 'vitest';

const declarationValue = (
  root: Root,
  selector: string,
  property: string,
): string | undefined => {
  let value: string | undefined;

  root.walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return;
    rule.walkDecls(property, (declaration) => {
      value = declaration.value;
    });
  });

  return value;
};

describe('Tailwind text styles', () => {
  it('emits font sizes from the Tailwind 4 theme API', async () => {
    const result = await postcss([tailwindcss()]).process(
      "@import 'tailwindcss'; @config '../tailwind.config.ts';",
      {
        from: path.resolve('src/app.css'),
      },
    );

    expect(declarationValue(result.root, 'h1', 'font-size')).toBe('1.875rem');
    expect(declarationValue(result.root, '.body-normal', 'font-size')).toBe(
      '0.875rem',
    );
  }, 30_000);
});
