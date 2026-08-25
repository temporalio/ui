import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { describe, expect, it } from 'vitest';

import temporal from './plugin';

const compileClasses = async (classes: string[]): Promise<string> => {
  const result = await postcss([
    tailwindcss({
      content: [{ raw: `<div class="${classes.join(' ')}"></div>` }],
      corePlugins: { preflight: false },
      plugins: [temporal],
    }),
  ]).process('@tailwind base; @tailwind utilities;', { from: undefined });

  return result.css;
};

const expectClass = (css: string, className: string): void => {
  expect(css).toContain(`.${className.replaceAll(':', '\\:')}`);
};

describe('semantic opacity API', () => {
  it('compiles the disabled opacity token', async () => {
    const css = await compileClasses(['opacity-disabled']);

    expectClass(css, 'opacity-disabled');
    expect(css).toContain('opacity: 0.32');
  });
});

describe('property-aware color API', () => {
  it('compiles the contracted colors for every color property', async () => {
    const classes = [
      'accent-auto',
      'accent-alpha-green-30',
      'accent-black',
      'bg-background-primary',
      'bg-surface-primary',
      'bg-interactive-primary',
      'bg-action-hover-overlay',
      'bg-overlay-primary',
      'bg-content-primary',
      'bg-content-static-text-success',
      'bg-surface-static-neutral',
      'bg-border-primary',
      'bg-white',
      'bg-black',
      'bg-indigo-9',
      'bg-alpha-red-30',
      'border-primary',
      'border-interactive-primary',
      'border-content-primary',
      'border-slate-1',
      'border-alpha-neutral-30',
      'border-white',
      'shadow-content-inverse-primary',
      'shadow-alpha-neutral-30',
      'shadow-black',
      'caret-primary',
      'caret-red-9',
      'divide-primary',
      'divide-purple-5',
      'fill-primary',
      'fill-indigo-9',
      'fill-none',
      'from-surface-primary',
      'via-actions-hover-overlay',
      'to-indigo-9',
      'outline-danger',
      'outline-interactive-primary',
      'outline-alpha-blue-30',
      'placeholder-tertiary',
      'placeholder-alpha-slate-20',
      'ring-danger',
      'ring-interactive-primary',
      'ring-green-7',
      'ring-alpha-indigo-30',
      'ring-offset-background-primary',
      'ring-offset-slate-1',
      'stroke-indigo-9',
      'stroke-none',
      'text-primary',
      'text-brand',
      'text-static-text-info',
      'text-static-text-success',
      'text-static-text-warning',
      'text-static-text-danger',
      'text-white',
      'text-indigo-6',
      'text-alpha-red-30',
      'decoration-danger',
      'decoration-indigo-6',
      'bg-inherit',
      'text-current',
      'border-transparent',
    ];
    const css = await compileClasses(classes);

    for (const className of classes) expectClass(css, className);

    expect(css).toContain('background-color: var(--color-background-primary)');
    expect(css).toContain(
      'background-color: var(--color-actions-hover-overlay)',
    );
    expect(css).toContain(
      'background-color: var(--color-content-static-text-success)',
    );
    expect(css).toContain('color: var(--color-content-primary)');
    expect(css).toContain('color: var(--color-content-static-text-info)');
    expect(css).toContain('color: var(--color-content-static-text-success)');
    expect(css).toContain('color: var(--color-content-static-text-warning)');
    expect(css).toContain('color: var(--color-content-static-text-danger)');
    expect(css).toContain(
      'background-color: var(--color-surface-static-neutral)',
    );
    expect(css).toContain('border-color: var(--color-border-primary)');
    expect(css).toContain(
      'color: rgb(193 208 255 / var(--tw-text-opacity, 1))',
    );
    expect(css).toContain(
      'border-color: rgb(251 251 250 / var(--tw-border-opacity, 1))',
    );
    expect(css).toContain(
      '--tw-ring-color: rgb(142 206 170 / var(--tw-ring-opacity, 1))',
    );
    expect(css).toContain('--tw-ring-color: var(--color-interactive-primary)');
    expect(css).toContain(
      '--tw-ring-offset-color: var(--color-background-primary)',
    );
    expect(css).toContain(
      '--tw-shadow-color: var(--color-content-inverse-primary)',
    );
    expect(css).toContain('fill: var(--color-content-primary)');
    expect(css).toContain('stroke: #3e63dd');
    expect(css).toContain('text-decoration-color: var(--color-content-danger)');
  });

  it('generates unprefixed semantic variables and preserves plural actions variables', async () => {
    const css = await compileClasses(['bg-action-hover-overlay']);

    expect(css).toContain('--color-content-primary:');
    expect(css).toContain('--color-actions-hover-overlay:');
    expect(css).not.toContain(['--color', 'io-'].join('-'));
  });

  it('uses explicit semantic ring and ring-offset defaults', async () => {
    const css = await compileClasses(['ring']);

    expect(css).toContain('--tw-ring-color: var(--color-interactive-primary)');
    expect(css).toContain(
      '--tw-ring-offset-color: var(--color-background-primary)',
    );
  });

  it('does not generate io, Tailwind default, or property-invalid colors', async () => {
    const surfacePrimary = ['surface', 'primary'].join('-');
    const contentWhite = ['content', 'white'].join('-');
    const invalidClasses = [
      ['accent', 'primary'],
      ['bg', 'io-surface-primary'],
      ['bg', 'gray-100'],
      ['bg', 'primary'],
      ['bg', contentWhite],
      ['border', surfacePrimary],
      ['border', contentWhite],
      ['caret', 'border-danger'],
      ['decoration', 'border-danger'],
      ['divide', 'interactive-primary'],
      ['fill', surfacePrimary],
      ['from', 'primary'],
      ['from', contentWhite],
      ['outline', 'content-primary'],
      ['placeholder', surfacePrimary],
      ['ring', surfacePrimary],
      ['ring-offset', 'primary'],
      ['shadow', 'primary'],
      ['shadow', contentWhite],
      ['stroke', 'primary'],
      ['text', 'red-500'],
      ['text', surfacePrimary],
    ].map((parts) => parts.join('-'));
    const css = await compileClasses([...invalidClasses, 'block']);

    for (const className of invalidClasses) {
      expect(css).not.toContain(`.${className}`);
    }
  });
});
