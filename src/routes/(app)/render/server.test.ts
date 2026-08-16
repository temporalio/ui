import { describe, expect, it } from 'vitest';

import { paletteCSSVariables } from '$lib/theme/variables';

import { GET } from './+server';

const render = async (palette: string) => {
  const response = await GET(
    new Request(
      `http://localhost/render?content=Palette&theme=dark&palette=${palette}`,
    ),
  );

  return response.text();
};

describe('rendered markdown palette', () => {
  it('serializes the selected palette for the isolated preview', async () => {
    const html = await render('ember');

    expect(html).toContain('data-palette="ember"');
    expect(html).toContain(
      `--color-text-brand: ${paletteCSSVariables.ember.light['--color-text-brand']};`,
    );
    expect(html).toContain(
      `--color-text-brand: ${paletteCSSVariables.ember.dark['--color-text-brand']};`,
    );
    expect(html).toMatch(
      /body\s*\{[\s\S]*?--md-text:\s*rgb\(var\(--color-text-primary\)\);/,
    );
  });

  it('falls back to the default palette for unsupported values', async () => {
    const html = await render('unsupported');

    expect(html).toContain('data-palette="precision"');
    expect(html).toContain(
      `--color-text-brand: ${paletteCSSVariables.precision.light['--color-text-brand']};`,
    );
  });
});
