// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

let component: Component<Record<string, unknown>>;
let renderComponent: typeof render;
let closeViteServer: (() => Promise<void>) | undefined;

beforeAll(async () => {
  const projectRoot = process.cwd();
  const lifecycle = await startIsolatedViteServer(
    createServer,
    {
      root: projectRoot,
      configFile: false,
      appType: 'custom',
      plugins: [svelte({ hot: false })],
      resolve: {
        alias: [
          {
            find: '$lib',
            replacement: path.resolve(projectRoot, 'src/lib'),
          },
          {
            find: '$types',
            replacement: path.resolve(projectRoot, 'src/types'),
          },
          {
            find: '$app',
            replacement: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
          },
        ],
      },
      server: { middlewareMode: true },
    },
    async (server) => ({
      component: (
        await server.ssrLoadModule(
          '/src/lib/components/event/event-hidden-run-row.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ component, renderComponent } = lifecycle.value);
}, 60_000);

afterAll(async () => {
  await closeViteServer?.();
});

const renderRow = (open: boolean, count = 14): string =>
  renderComponent(component, {
    props: {
      run: {
        kind: 'hidden-run',
        key: 'hidden-run-5-18',
        count,
        firstId: '5',
        lastId: '18',
        open,
        rows: [],
      },
      onToggle: () => {},
    },
  }).body;

describe('EventHiddenRunRow', () => {
  it('renders a closed run as a full-width row with a real button', () => {
    const body = renderRow(false);

    expect(body).toContain('data-testid="hidden-run-row"');
    expect(body).toContain('colspan="4"');
    expect(body).toMatch(/<button[^>]*type="button"/);
    expect(body).toContain('aria-expanded="false"');
    expect(body).toContain('data-run-key="hidden-run-5-18"');
    expect(body).toContain('14 routine events hidden · events 5–18');
  });

  it('renders an open run with the shown text', () => {
    const body = renderRow(true);

    expect(body).toContain('aria-expanded="true"');
    expect(body).toContain('14 routine events shown · events 5–18');
  });

  it('uses the singular form for one event', () => {
    expect(renderRow(false, 1)).toContain(
      '1 routine event hidden · events 5–18',
    );
  });
});
