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
let writable: typeof import('svelte/store').writable;
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
          // date-fns-tz ships CommonJS; no assertion here depends on a time.
          {
            find: /^date-fns-tz$/,
            replacement: path.resolve(
              projectRoot,
              'src/lib/catalog/browser/date-fns-tz-test-double.ts',
            ),
          },
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
          '/src/lib/components/search-attribute-filter/natural-language-query.svelte',
        )
      ).default,
      writable: (await server.ssrLoadModule('svelte/store')).writable,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ component, renderComponent, writable } = lifecycle.value);
}, 60_000);

afterAll(async () => {
  await closeViteServer?.();
});

const renderQuery = (): string =>
  renderComponent(component, {
    props: {
      filters: writable([]),
      searchAttributes: { WorkflowType: 'Keyword' },
      id: 'workflow',
    },
  }).body;

describe('NaturalLanguageQuery', () => {
  it('renders the input, the submit button and the status region', () => {
    const body = renderQuery();

    expect(body).toContain('data-testid="workflow-nl-search-input"');
    expect(body).toContain('data-testid="workflow-nl-search-button"');
    expect(body).toContain('data-testid="workflow-nl-search-status"');
    expect(body).toContain('aria-live="polite"');
    expect(body).toContain('role="search"');
    expect(body).toContain('Describe the workflows you want to find');
  });

  it('marks the feature as experimental', () => {
    expect(renderQuery()).toContain('Experimental');
  });

  it('disables the submit button while the input is empty', () => {
    expect(renderQuery()).toMatch(
      /<button[^>]*data-testid="workflow-nl-search-button"[^>]*disabled|<button[^>]*disabled[^>]*data-testid="workflow-nl-search-button"/,
    );
  });
});
