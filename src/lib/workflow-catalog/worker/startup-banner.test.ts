import { describe, expect, it } from 'vitest';

import {
  formatWorkflowCatalogBanner,
  supportsAnsiColor,
} from './startup-banner';

const targets = [
  {
    id: 'shared-workflows',
    namespace: 'default',
    taskQueue: 'ui-workflow-catalog',
  },
  {
    id: 'local-workflows',
    namespace: 'default',
    taskQueue: 'ui-workflow-catalog-local',
  },
];

const stripAnsi = (value: string) =>
  // eslint-disable-next-line no-control-regex
  value.replace(/\[\d+m/g, '');

describe('formatWorkflowCatalogBanner', () => {
  it('frames the catalog URL and every running target in one block', () => {
    const banner = formatWorkflowCatalogBanner({ targets });
    const lines = banner.split('\n');

    expect(lines[0]).toBe('');
    expect(lines[1]).toMatch(/^╭─+╮$/);
    expect(lines.at(-2)).toMatch(/^╰─+╯$/);
    expect(lines.at(-1)).toBe('');
    expect(banner).toContain('WORKFLOW CATALOG READY');
    expect(banner).toContain(
      'http://localhost:3000/namespaces/default/workflow-catalog',
    );
    expect(banner).toContain(
      'shared-workflows → default / ui-workflow-catalog',
    );
    expect(banner).toContain(
      'local-workflows → default / ui-workflow-catalog-local',
    );
  });

  it('keeps every framed line the same width', () => {
    const widths = new Set(
      formatWorkflowCatalogBanner({ targets })
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => [...line].length),
    );

    expect(widths.size).toBe(1);
  });

  it('lists one catalog URL per namespace in play', () => {
    const banner = formatWorkflowCatalogBanner({
      targets: [
        targets[0],
        { id: 'other', namespace: 'staging', taskQueue: 'queue' },
      ],
    });

    expect(banner).toContain('/namespaces/default/workflow-catalog');
    expect(banner).toContain('/namespaces/staging/workflow-catalog');
  });

  it('accepts a custom UI origin', () => {
    expect(
      formatWorkflowCatalogBanner({ targets, origin: 'http://localhost:4000' }),
    ).toContain('http://localhost:4000/namespaces/default/workflow-catalog');
  });

  it('colors the heading, URL, and frame when color is enabled', () => {
    const banner = formatWorkflowCatalogBanner({ targets, color: true });

    expect(banner).toContain('[1m[32mWORKFLOW CATALOG READY');
    expect(banner).toContain(
      '[36mhttp://localhost:3000/namespaces/default/workflow-catalog',
    );
    expect(banner).toContain('[90m╭');
    expect(banner).toContain('[0m');
  });

  it('keeps the frame aligned by measuring visible text only', () => {
    const widths = new Set(
      formatWorkflowCatalogBanner({ targets, color: true })
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => [...stripAnsi(line)].length),
    );

    expect(widths.size).toBe(1);
  });

  it('produces identical visible text with and without color', () => {
    expect(
      stripAnsi(formatWorkflowCatalogBanner({ targets, color: true })),
    ).toBe(formatWorkflowCatalogBanner({ targets, color: false }));
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
