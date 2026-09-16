import { describe, expect, it } from 'vitest';

import { formatCatalogBanner, supportsAnsiColor } from './startup-banner';

const targets = [
  {
    id: 'shared-workflows',
    namespace: 'default',
    taskQueue: 'ui-catalog',
  },
  {
    id: 'local-workflows',
    namespace: 'default',
    taskQueue: 'ui-catalog-local',
  },
];

const stripAnsi = (value: string) =>
  // eslint-disable-next-line no-control-regex
  value.replace(/\[\d+m/g, '');

describe('formatCatalogBanner', () => {
  it('frames the catalog URL and every running target in one block', () => {
    const banner = formatCatalogBanner({ targets });
    const lines = banner.split('\n');

    expect(lines[0]).toBe('');
    expect(lines[1]).toMatch(/^╭─+╮$/);
    expect(lines.at(-2)).toMatch(/^╰─+╯$/);
    expect(lines.at(-1)).toBe('');
    expect(banner).toContain('CATALOG READY');
    expect(banner).toContain(
      'http://localhost:3000/namespaces/default/catalog',
    );
    expect(banner).toContain('shared-workflows → default / ui-catalog');
    expect(banner).toContain('local-workflows → default / ui-catalog-local');
  });

  it('keeps every framed line the same width', () => {
    const widths = new Set(
      formatCatalogBanner({ targets })
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => [...line].length),
    );

    expect(widths.size).toBe(1);
  });

  it('lists one catalog URL per namespace in play', () => {
    const banner = formatCatalogBanner({
      targets: [
        targets[0],
        { id: 'other', namespace: 'staging', taskQueue: 'queue' },
      ],
    });

    expect(banner).toContain('/namespaces/default/catalog');
    expect(banner).toContain('/namespaces/staging/catalog');
  });

  it('accepts a custom UI origin', () => {
    expect(
      formatCatalogBanner({ targets, origin: 'http://localhost:4000' }),
    ).toContain('http://localhost:4000/namespaces/default/catalog');
  });

  it('colors the heading, URL, and frame when color is enabled', () => {
    const banner = formatCatalogBanner({ targets, color: true });

    expect(banner).toContain('[1m[32mCATALOG READY');
    expect(banner).toContain(
      '[36mhttp://localhost:3000/namespaces/default/catalog',
    );
    expect(banner).toContain('[90m╭');
    expect(banner).toContain('[0m');
  });

  it('keeps the frame aligned by measuring visible text only', () => {
    const widths = new Set(
      formatCatalogBanner({ targets, color: true })
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => [...stripAnsi(line)].length),
    );

    expect(widths.size).toBe(1);
  });

  it('produces identical visible text with and without color', () => {
    expect(stripAnsi(formatCatalogBanner({ targets, color: true }))).toBe(
      formatCatalogBanner({ targets, color: false }),
    );
  });
});

describe('supportsAnsiColor', () => {
  it('colors an interactive terminal', () => {
    expect(supportsAnsiColor({ isTTY: true, environment: {} })).toBe(true);
  });

  it('stays plain when output is redirected', () => {
    expect(supportsAnsiColor({ isTTY: false, environment: {} })).toBe(false);
  });

  it('honors NO_COLOR even on a terminal', () => {
    expect(
      supportsAnsiColor({ isTTY: true, environment: { NO_COLOR: '1' } }),
    ).toBe(false);
  });

  it('honors FORCE_COLOR when output is redirected', () => {
    expect(
      supportsAnsiColor({ isTTY: false, environment: { FORCE_COLOR: '1' } }),
    ).toBe(true);
  });
});
