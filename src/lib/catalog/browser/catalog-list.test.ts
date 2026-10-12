// @vitest-environment node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resolve } from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';
import { changePendingRunCount } from './catalog-list-state';
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
    expect(body).toMatch(/<strong[^>]*>0<\/strong> of 0\s+examples/);
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
    expect(body).toContain('<span>Workflow</span>');
    expect(body).toMatch(/Task queue\s*<span[^>]*font-mono[^>]*>catalog-tasks/);
    expect(body).toMatch(
      /class="[^"]*border-tertiary[^"]*bg-surface-tertiary[^"]*text-secondary[^"]*"[\s\S]*?<span>OSS<\/span>/,
    );
    expect(body).toMatch(
      /<button[^>]*class="catalog-tag[^"]*"[^>]*aria-pressed="false"[^>]*>Child workflows<\/button>/,
    );
    expect(body.match(/Not run/g)).toHaveLength(1);
    expect(body).toContain('>Start<');
    expect(body).toContain('Configure');
  });

  it('shows kind, feature, and source facets with counts', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogList, {
      props: { descriptors: [descriptor], host, sessionStore, exampleHref },
    });
    const nav = body
      .split('aria-label="Filter examples"')[1]
      ?.split('</nav>')[0];

    expect(nav).toContain('Execution kind');
    expect(nav).toContain('Feature');
    expect(nav).toContain('Source');
    expect(nav).toMatch(/All kinds<\/span>\s*<span[^>]*>1<\/span>/);
    expect(nav).toMatch(
      /Standalone Nexus Operation<\/span>\s*<span[^>]*>0<\/span>/,
    );
    expect(nav).toMatch(/OSS<\/span>\s*<span[^>]*>1<\/span>/);
  });

  it('lists standalone Nexus operation examples with workflows and labels them by endpoint', () => {
    const nexusDescriptor: BrowserCatalogDescriptor = {
      ...descriptor,
      id: 'slow-nexus-operation',
      title: 'Slow Nexus operation',
      execution: {
        kind: 'standalone-nexus-operation',
        targetId: 'catalog',
        namespace: 'default',
        taskQueue: 'catalog-tasks',
        endpoint: 'catalog-endpoint',
        service: 'catalog-service',
        operation: 'slowGreeting',
        policies: {},
      },
    };
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogList, {
      props: {
        descriptors: [nexusDescriptor, descriptor],
        host,
        sessionStore,
        exampleHref,
      },
    });
    const list = body.split('aria-label="Catalog examples"')[1] ?? '';

    expect(body.match(/<ul/g)).toHaveLength(1);
    expect(list.indexOf('Slow Nexus operation')).toBeLessThan(
      list.indexOf('Order lifecycle'),
    );
    expect(list).toContain('<span>Standalone Nexus Operation</span>');
    expect(list).toMatch(/Endpoint\s*<span[^>]*>catalog-endpoint/);
  });

  it('keeps the example name readable on small screens', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogList, {
      props: { descriptors: [descriptor], host, sessionStore, exampleHref },
    });

    expect(body).toMatch(
      /<a[^>]*class="[^"]*break-words[^"]*"[^>]*>[\s\S]*?Order lifecycle[\s\S]*?<\/a>/,
    );
    expect(body).not.toMatch(/<a[^>]*class="[^"]*table-link[^"]*truncate/);
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

  it('derives source filter controls and source labels from supplied descriptors', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-list.svelte'),
      'utf8',
    );

    expect(source).toContain('catalog-search');
    expect(source).toContain('descriptor.source.id');
    expect(source).toContain('descriptor.source.label');
    expect(source).not.toContain("['all', 'shared', 'local']");
    expect(source).toContain('exampleHref: (exampleId: string) => string;');
    expect(source).not.toContain('routeForCatalogExample');
    expect(
      source.match(/href=\{exampleHref\(descriptor\.id\)\}/g),
    ).toHaveLength(2);
    expect(source).toContain('startWithDefaults');
    expect(source).toContain('sessionStore.latest');
    expect(source).not.toContain('Textarea');
    expect(source).not.toContain('JSON.stringify(');
  });

  it('uses client navigation when opening a workflow from its title', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-list.svelte'),
      'utf8',
    );

    expect(source).toContain("import Link from '$lib/holocene/link.svelte';");
    expect(source).toMatch(
      /<Link\s+class="table-link block break-words text-sm font-medium text-primary"\s+href=\{exampleHref\(descriptor\.id\)\}/,
    );
  });

  it('tracks overlapping quick runs per example without disabling repeat runs', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-list.svelte'),
      'utf8',
    );
    const firstRun = changePendingRunCount({}, 'shared-order', 1);
    const overlappingRuns = changePendingRunCount(
      changePendingRunCount(firstRun, 'shared-order', 1),
      'local-order',
      1,
    );
    const oneSharedRunFinished = changePendingRunCount(
      overlappingRuns,
      'shared-order',
      -1,
    );

    expect(oneSharedRunFinished).toEqual({
      'shared-order': 1,
      'local-order': 1,
    });
    expect(source).toContain('pendingRunCount(descriptor.id)');
    expect(source).toContain('pointer-events-none absolute');
    expect(source).toContain('Start (${pending} pending)');
    expect(source).not.toContain('disabled={runningExampleId');
  });
});
