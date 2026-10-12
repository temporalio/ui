// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';
import { createCatalogSessionStore } from './session-store';
import type { BrowserCatalogDescriptor } from './types';
import type { WorkbenchHost } from './workbench-host';

let catalogList: Component<Record<string, unknown>>;
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
        alias: {
          $lib: path.resolve(projectRoot, 'src/lib'),
          $types: path.resolve(projectRoot, 'src/types'),
          $app: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
        },
      },
      server: { hmr: false, middlewareMode: true },
    },
    async (server) => ({
      catalogList: (
        await server.ssrLoadModule(
          '/src/lib/catalog/browser/catalog-list.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ catalogList, renderComponent } = lifecycle.value);
}, catalogHarnessSetupTimeoutMs);

afterAll(async () => closeViteServer?.());

const descriptor: BrowserCatalogDescriptor = {
  id: 'order-lifecycle',
  source: { id: 'oss', label: 'OSS' },
  title: 'Order lifecycle',
  description: 'Start and inspect an order workflow.',
  capabilityTags: ['Workflow'],
  expectedEvidence: ['Workflow details'],
  input: {
    defaultValue: ['customer-123'],
    schema: { type: 'array', items: { type: 'string' } },
  },
  startOptions: {
    defaultValue: { workflowId: 'order-lifecycle-01' },
    schema: { type: 'object' },
  },
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'default',
    taskQueue: 'catalog-tasks',
    workflowType: 'OrderLifecycle',
  },
};

const host: WorkbenchHost = {
  start: vi.fn(),
  checkReadiness: vi.fn(async () => []),
  observe: vi.fn(),
  evidenceLink: vi.fn(),
};

const exampleHref = (exampleId: string) => `/examples/${exampleId}`;

describe('CatalogList', () => {
  it('shows an empty state inside the example list when nothing matches', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogList, {
      props: { descriptors: [], host, sessionStore, exampleHref },
    });

    expect(body).toContain('aria-label="Catalog examples"');
    expect(body).toContain('No examples match the current filters.');
  });

  it('renders each example with its kind, location, source, features, run, and actions', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogList, {
      props: {
        descriptors: [{ ...descriptor, capabilityTags: ['child-workflows'] }],
        host,
        sessionStore,
        exampleHref,
      },
    });

    expect(body).toContain('Order lifecycle');
    expect(body).toContain('Start and inspect an order workflow.');
    expect(body).toContain('data-testid="catalog-kind-badge"');
    expect(body).toContain('Task Queue');
    expect(body).toContain('catalog-tasks');
    expect(body).toContain('OSS');
    expect(body).toContain('Child workflows');
    expect(body.match(/Not run/g)).toHaveLength(1);
    expect(body).toContain('>Start<');
    expect(body).toContain('Configure');
  });

  it('uses the host-provided href for the workflow title link', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogList, {
      props: {
        descriptors: [descriptor],
        host,
        sessionStore,
        exampleHref: (exampleId: string) => `/cloud/catalog/${exampleId}`,
      },
    });

    expect(body).toMatch(
      /<a[^>]*href="\/cloud\/catalog\/order-lifecycle"[^>]*>[\s\S]*?Order lifecycle[\s\S]*?<\/a>/,
    );
  });

  it('shows a quick run from the shared session store in its workflow row', async () => {
    const sessionHost: WorkbenchHost = {
      start: vi.fn(async (command) => ({
        status: 'accepted' as const,
        reference: {
          exampleId: command.exampleId,
          kind: descriptor.execution.kind,
          attempt: command.attempt,
          target: descriptor.execution,
          runId: 'run-1',
        },
      })),
      checkReadiness: vi.fn(async () => []),
      observe: vi.fn(async () => ({
        state: 'terminal' as const,
        status: 'completed' as const,
        snapshot: {},
      })),
      evidenceLink: vi.fn(),
    };
    const sessionStore = createCatalogSessionStore(sessionHost, {
      createId: () => 'attempt-1',
      now: () => Date.now() - 60_000,
    });

    await sessionStore.start({
      descriptor,
      input: descriptor.input.defaultValue,
      startOptions: descriptor.startOptions.defaultValue,
    });
    await Promise.resolve();
    const { body } = renderComponent(catalogList, {
      props: {
        descriptors: [descriptor],
        host: sessionHost,
        sessionStore,
        exampleHref,
      },
    });

    expect(body).toContain('Completed');
    expect(body).toMatch(
      /class="[^"]*border-success[^"]*bg-surface-success[^"]*text-success[^"]*"[\s\S]*?Completed/,
    );
    expect(body).toMatch(/1m ago|just now/);
  });

  it('presents nonterminal run states with friendly labels', async () => {
    const sessionHost: WorkbenchHost = {
      start: vi.fn(async (command) => ({
        status: 'rejected' as const,
        reason: 'conflict' as const,
        reference: {
          exampleId: command.exampleId,
          kind: descriptor.execution.kind,
          attempt: command.attempt,
          target: descriptor.execution,
        },
      })),
      checkReadiness: vi.fn(async () => []),
      observe: vi.fn(),
      evidenceLink: vi.fn(),
    };
    const sessionStore = createCatalogSessionStore(sessionHost, {
      createId: () => 'attempt-1',
    });

    await sessionStore.start({
      descriptor,
      input: descriptor.input.defaultValue,
      startOptions: descriptor.startOptions.defaultValue,
    });
    const { body } = renderComponent(catalogList, {
      props: {
        descriptors: [descriptor],
        host: sessionHost,
        sessionStore,
        exampleHref,
      },
    });

    expect(body).toContain('Launch rejected');
    expect(body).not.toContain('>launch-rejected<');
  });
});
