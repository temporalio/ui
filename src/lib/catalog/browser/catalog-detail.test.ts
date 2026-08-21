// @vitest-environment node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resolve } from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  IconCheckCircle,
  type IconComponent,
  IconQuestionCircle,
  IconWarning,
} from '$lib/io/icon';
import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

import { catalogHarnessSetupTimeoutMs } from './catalog-harness-timeout';
import { createCatalogSessionStore } from './session-store';
import type { BrowserCatalogDescriptor } from './types';
import type { WorkbenchHost } from './workbench-host';

// The component is loaded through an isolated Vite server, so the icon
// components it returns are different objects than the ones imported here.
// Compare by compiled component name rather than by reference.
const iconNamed = (icon: { name: string }) => ({
  asymmetricMatch: (actual: unknown) =>
    typeof actual === 'function' &&
    (actual as { name: string }).name === icon.name,
  toString: () => `iconNamed(${icon.name})`,
});

let catalogDetail: Component<Record<string, unknown>>;
let renderComponent: typeof render;
let closeViteServer: (() => Promise<void>) | undefined;
let isCurrentCatalogDetailRequest: (request: {
  currentDescriptor: BrowserCatalogDescriptor;
  currentEpoch: number;
  requestDescriptor: BrowserCatalogDescriptor;
  requestEpoch: number;
}) => boolean;
let readinessPresentation: (config: {
  kind: 'nexus-endpoint' | 'worker';
  state:
    | 'error'
    | 'indeterminate'
    | 'loading'
    | 'missing'
    | 'ready'
    | 'skipped'
    | 'unavailable';
  taskQueue: string;
}) => {
  Icon: IconComponent;
  iconClass: string;
  iconLabel: string;
  label: string;
  tooltip: string;
};
let nexusEndpointCreateCommand: (config: {
  endpoint: string;
  namespace: string;
  taskQueue: string;
}) => string;

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
          '$lib/holocene/markdown-editor/preview.svelte': path.resolve(
            projectRoot,
            'src/lib/catalog/browser/markdown-preview-test-double.svelte',
          ),
          // These two ship CommonJS this bare SSR runner cannot evaluate, and
          // processing them costs more setup time than the hook allows.
          'date-fns-tz': path.resolve(
            projectRoot,
            'src/lib/catalog/browser/date-fns-tz-test-double.ts',
          ),
          'tailwindcss/colors': path.resolve(
            projectRoot,
            'src/lib/catalog/browser/tailwind-colors-test-double.ts',
          ),
          $lib: path.resolve(projectRoot, 'src/lib'),
          $types: path.resolve(projectRoot, 'src/types'),
          $app: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
        },
      },
      server: { hmr: false, middlewareMode: true },
    },
    async (server) => {
      const module = await server.ssrLoadModule(
        '/src/lib/catalog/browser/catalog-detail.svelte',
      );

      return {
        catalogDetail: module.default,
        isCurrentCatalogDetailRequest: module.isCurrentCatalogDetailRequest,
        nexusEndpointCreateCommand: module.nexusEndpointCreateCommand,
        readinessPresentation: module.readinessPresentation,
        renderComponent: (await server.ssrLoadModule('svelte/server')).render,
      };
    },
  );
  closeViteServer = lifecycle.close;
  ({
    catalogDetail,
    isCurrentCatalogDetailRequest,
    nexusEndpointCreateCommand,
    renderComponent,
    readinessPresentation,
  } = lifecycle.value);
}, catalogHarnessSetupTimeoutMs);

afterAll(async () => closeViteServer?.());

const descriptor: BrowserCatalogDescriptor = {
  id: 'order-lifecycle',
  source: { id: 'oss', label: 'OSS' },
  title: 'Order lifecycle',
  description: 'Start and inspect an order workflow.',
  capabilityTags: ['Workflow', 'Links'],
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

describe('CatalogDetail', () => {
  it('keeps configuration and empty runs together before execution context', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(body).toMatch(
      /aria-label="Configure and run"[\s\S]*aria-label="Configuration"[\s\S]*aria-label="Runs"[\s\S]*aria-label="Execution details"/,
    );
    expect(body).toContain('data-testid="run-sessions-region"');
    expect(body).toMatch(/<th[^>]*scope="col"[^>]*>Workflow ID<\/th>/);
    expect(body).toContain('Runs appear here until you refresh the page.');
    expect(body).not.toContain('Run sessions');
  });

  it('renders a native configure and run workspace with compact execution context', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(body).toContain('aria-label="Configure and run"');
    expect(body).toMatch(
      /class="[^"]*grid[^"]*w-full[^"]*xl:grid-cols-\[minmax\(0,1fr\)_20rem\][^"]*"[\s\S]*aria-label="Configure and run"/,
    );
    expect(body).not.toMatch(/class="[^"]*(?:mx-auto|max-w-7xl)[^"]*"/);
    expect(body).toContain('aria-label="Configuration"');
    expect(body).toContain('aria-label="Execution details"');
    expect(body).toContain('Input JSON');
    expect(body).toContain('catalog-tasks');
    expect(body).toContain('Workflow details');
    expect(body).toContain('>Start<');
  });

  it('uses plain language for input and start options', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(body).toContain('Input JSON');
    expect(body).toContain('JSON passed to the example when it starts.');
    expect(body).toContain('>Start options<');
    expect(source).toContain(
      'These options apply only when you start this example.',
    );
  });

  it('keeps start options and Run together in one responsive action row', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(body).toMatch(
      /class="[^"]*flex-wrap[^"]*justify-between[^"]*"[\s\S]*>Start options<[\s\S]*>Start</,
    );
    expect(source).toMatch(
      /aria-label="Start options"[\s\S]*hidden={!configureOpen}[\s\S]*class="surface-primary sticky bottom-0 flex flex-wrap items-center justify-between/,
    );
  });

  it('shows worker availability while checking', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(body).toMatch(
      /aria-label="Readiness"[\s\S]*>Readiness<[\s\S]*>Refresh<[\s\S]*aria-live="polite"[\s\S]*tabindex="0"[\s\S]*aria-label="Worker readiness is checking"/,
    );
    expect(body).toContain('>Handler worker is polling<');
    expect(body).toContain('Checking for workers…');
  });

  it('keeps the worker label stable while its readiness icon and tooltip change', () => {
    expect(
      readinessPresentation({
        kind: 'worker',
        state: 'ready',
        taskQueue: 'catalog-tasks',
      }),
    ).toEqual({
      Icon: iconNamed(IconCheckCircle),
      iconClass: 'text-success',
      iconLabel: 'Worker readiness is ready',
      label: 'Handler worker is polling',
      tooltip: 'A Worker is polling.',
    });
  });

  it('renders declared setup instructions and omits the section otherwise', () => {
    const { body } = renderComponent(catalogDetail, {
      props: {
        descriptor,
        host,
        sessionStore: createCatalogSessionStore(host),
      },
    });
    expect(body).not.toContain('aria-label="Setup"');

    const { body: withSetup } = renderComponent(catalogDetail, {
      props: {
        descriptor: {
          ...descriptor,
          setupMarkdown: 'Run `make setup` first.',
        },
        host,
        sessionStore: createCatalogSessionStore(host),
      },
    });
    expect(withSetup).toContain('aria-label="Setup"');
    expect(withSetup).toContain('Setup</h2>');
    expect(withSetup).toContain('Run `make setup` first.');
  });

  it('explains why a run was rejected instead of only saying it failed', async () => {
    const rejectingHost: WorkbenchHost = {
      start: vi.fn(async (command) => ({
        status: 'rejected' as const,
        reason: 'not-found' as const,
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
    const sessionStore = createCatalogSessionStore(rejectingHost, {
      createId: () => 'attempt-1',
    });

    await sessionStore.start({
      descriptor,
      input: descriptor.input.defaultValue,
      startOptions: descriptor.startOptions.defaultValue,
    });
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host: rejectingHost, sessionStore },
    });

    expect(body).toContain('Start failed');
    expect(body).toContain('This server does not support that execution');
    expect(body).not.toContain('not-found');
  });

  it('presents no polling worker as advisory without disabling Run', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(
      readinessPresentation({
        kind: 'worker',
        state: 'unavailable',
        taskQueue: 'catalog-tasks',
      }),
    ).toEqual({
      Icon: iconNamed(IconWarning),
      iconClass: 'text-warning',
      iconLabel: 'Worker readiness is unavailable',
      label: 'Handler worker is polling',
      tooltip:
        'This run will wait for a Worker to poll the catalog-tasks Task Queue. Run "pnpm catalog worker" to start one.',
    });
    expect(body).toMatch(
      /<button(?=[^>]*data-variant="primary")(?![^>]*\sdisabled(?:=""|="true"|(?=\s|>)))[^>]*>[\s\S]*?Run/,
    );
  });

  it('uses friendly unknown language when worker status cannot be verified', () => {
    for (const state of [
      'indeterminate',
      'skipped',
      'error',
      'missing',
    ] as const) {
      expect(
        readinessPresentation({
          kind: 'worker',
          state,
          taskQueue: 'catalog-tasks',
        }),
      ).toMatchObject({
        Icon: iconNamed(IconQuestionCircle),
        iconClass: 'text-secondary',
        iconLabel: 'Worker readiness status is unknown',
        label: 'Handler worker is polling',
        tooltip: 'Worker status couldn’t be checked.',
      });
    }
  });

  it('uses the same static-label presentation for Nexus readiness rows', () => {
    for (const [state, expected] of [
      [
        'ready',
        {
          Icon: iconNamed(IconCheckCircle),
          iconLabel: 'Nexus endpoint readiness is ready',
          tooltip: 'Nexus endpoint is ready.',
        },
      ],
      [
        'unavailable',
        {
          Icon: iconNamed(IconWarning),
          iconLabel: 'Nexus endpoint readiness is unavailable',
          tooltip: 'Nexus endpoint is unavailable.',
        },
      ],
    ] as const) {
      expect(
        readinessPresentation({
          kind: 'nexus-endpoint',
          state,
          taskQueue: 'catalog-tasks',
        }),
      ).toMatchObject({
        label: 'Endpoint matches the declared target and policy',
        ...expected,
      });
    }
  });

  it('hands off the exact endpoint create command when the Nexus endpoint is unavailable', () => {
    expect(
      nexusEndpointCreateCommand({
        endpoint: 'ui-catalog',
        namespace: 'default',
        taskQueue: 'ui-catalog',
      }),
    ).toBe(
      'temporal operator nexus endpoint create --name ui-catalog --target-namespace default --target-task-queue ui-catalog',
    );

    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain(
      "check.kind === 'nexus-endpoint' && check.state === 'unavailable'",
    );
    expect(source).toContain('content={nexusEndpointCreateCommand({');
    expect(source).toContain('endpoint: check.endpoint,');
    expect(source).toContain('Create the declared endpoint');
  });

  it('hands off the worker start command when no worker is polling', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain(
      "{#if !readinessLoading && workerReadinessState === 'unavailable'}",
    );
    expect(source).toContain('content="pnpm catalog worker"');
    expect(source).toContain('Start a catalog worker');
  });

  it('loads worker availability on detail changes and supports manual refresh', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain('createReadinessLoader');
    expect(source).toContain('readinessLoader.load(currentDescriptor.id)');
    expect(source).toContain(
      'void refreshReadiness(currentDescriptor, requestEpoch)',
    );
    expect(source).toContain('refreshReadiness(descriptor, descriptorEpoch)');
  });

  it('keeps the fresh pre-run worker result in the availability panel only', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain('onReadiness: (checks)');
    expect(source).toContain('isCurrentCatalogDetailRequest');
    expect(source).toContain(
      "readiness.filter((check) => check.kind !== 'worker')",
    );
    expect(source).toContain('{#each prerequisiteReadiness as check');
    expect(source).toContain('as check, index (`${check.kind}-${index}`)');
    expect(source).not.toContain('{#each readiness as check');
  });

  it('rejects an old pre-run result after the descriptor changes', () => {
    const nextDescriptor = {
      ...descriptor,
      id: 'next-order-lifecycle',
    } satisfies BrowserCatalogDescriptor;

    expect(
      isCurrentCatalogDetailRequest({
        currentDescriptor: nextDescriptor,
        currentEpoch: 2,
        requestDescriptor: descriptor,
        requestEpoch: 1,
      }),
    ).toBe(false);
    expect(
      isCurrentCatalogDetailRequest({
        currentDescriptor: nextDescriptor,
        currentEpoch: 2,
        requestDescriptor: nextDescriptor,
        requestEpoch: 2,
      }),
    ).toBe(true);
  });

  it('orders a compact Readiness card between target and evidence', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(body).toMatch(
      /aria-label="Execution details"[\s\S]*aria-label="Readiness"[\s\S]*Checking for workers…[\s\S]*aria-label="What to verify"/,
    );
    expect(body).toContain('role="tooltip"');
    expect(body).toContain('aria-label="Worker readiness is checking"');
    expect(body).toContain('aria-hidden="true"');
    expect(body).toContain('flex size-4 shrink-0 items-center justify-center');
  });

  it('separates execution details and verification into compact rail panels', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(body).toContain('aria-label="Execution details"');
    expect(body).toContain('aria-label="What to verify"');
    expect(body).toMatch(
      /<section class="[^"]*surface-primary[^"]*border border-subtle[^"]*" aria-label="Execution details"/,
    );
    expect(body).toMatch(
      /<section class="[^"]*surface-primary[^"]*border border-subtle[^"]*" aria-label="What to verify"/,
    );
    expect(body).toMatch(
      /aria-label="Execution details"[\s\S]*Workflow[\s\S]*catalog/,
    );
    // The task queue belongs to the Configuration fields now, not both places.
    expect(body.match(/catalog-tasks/g)).toHaveLength(1);
    expect(body).toMatch(/aria-label="What to verify"[\s\S]*Workflow details/);
  });

  it('presents the execution type once and suppresses a duplicate capability', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: {
        descriptor: {
          ...descriptor,
          capabilityTags: ['workflow', 'Links'],
          expectedEvidence: ['Details'],
        },
        host,
        sessionStore,
      },
    });

    expect(body).toMatch(/<dt[^>]*>Type<\/dt>[\s\S]*<dd[^>]*>Workflow<\/dd>/);
    expect(body.match(/>Workflow(?:<!---->)?<\//g)).toHaveLength(1);
    expect(body).toContain('Links');
  });

  it('renders prior sessions in a bounded native table below configuration', async () => {
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
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host: sessionHost, sessionStore },
    });

    expect(body).toContain('<table');
    expect(body).toMatch(
      /data-testid="run-sessions-region"[^>]*class="[^"]*max-h-96[^"]*overflow-auto/,
    );
    expect(body).toMatch(/<th[^>]*scope="col"[^>]*>Workflow ID<\/th>/);
    expect(body).toMatch(/<th[^>]*scope="col"[^>]*>Started<\/th>/);
    expect(body).toMatch(/<th[^>]*scope="col"[^>]*>Status<\/th>/);
    expect(body).toMatch(/<th[^>]*scope="col"[^>]*>Actions<\/th>/);
    expect(body).toContain('attempt-1');
    expect(body).toContain('Completed');
  });

  it('keeps populated run actions wide, compact, and non-wrapping', async () => {
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
      evidenceLink: vi.fn(() => ({
        href: '/workflows/order-lifecycle/run-1',
        label: 'Workflow details',
      })),
    };
    const sessionStore = createCatalogSessionStore(sessionHost, {
      createId: () => 'attempt-1',
    });

    await sessionStore.start({
      descriptor,
      input: descriptor.input.defaultValue,
      startOptions: descriptor.startOptions.defaultValue,
    });
    await Promise.resolve();
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host: sessionHost, sessionStore },
    });

    expect(body).toMatch(
      /<th[^>]*class="[^"]*w-60[^"]*!text-right[^"]*"[^>]*>Actions<\/th>/,
    );
    expect(body).toMatch(/<table[^>]*class="[^"]*min-w-\[44rem\][^"]*"/);
    expect(body).toMatch(
      /<td>\s*<div class="[^"]*flex[^"]*flex-nowrap[^"]*gap-1[^"]*sm:gap-2[^"]*"/,
    );
    expect(body).toMatch(
      /data-testid="run-sessions-region"[^>]*class="[^"]*max-h-96[^"]*overflow-auto/,
    );
  });

  it('uses compact status and details controls without changing run row spacing', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain('class="px-1.5 py-0 text-xs leading-5"');
    expect(source).toContain('class="h-7 px-1.5"');
    expect(source).toContain(
      'class="truncate py-2 font-mono text-xs text-secondary"',
    );
  });

  it('links accepted sessions to their expected run evidence', async () => {
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
      evidenceLink: vi.fn(() => ({
        href: '/workflows/order-lifecycle/run-1',
        label: 'Workflow details',
      })),
    };
    const sessionStore = createCatalogSessionStore(sessionHost, {
      createId: () => 'attempt-1',
    });

    await sessionStore.start({
      descriptor,
      input: descriptor.input.defaultValue,
      startOptions: descriptor.startOptions.defaultValue,
    });
    await Promise.resolve();
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host: sessionHost, sessionStore },
    });

    expect(body).toContain('href="/workflows/order-lifecycle/run-1"');
    expect(body).toContain('Workflow details');
  });

  it('presents nonterminal session states as readable run feedback', async () => {
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
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host: sessionHost, sessionStore },
    });

    expect(body).toContain('Start failed');
    expect(body).not.toContain('>launch-rejected<');
  });

  it('keeps the run link anchored while observation controls come and go', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );
    const actionsRow = source.slice(
      source.indexOf('flex flex-nowrap items-center justify-end'),
    );

    expect(actionsRow.indexOf('aria-label="Resume checking"')).toBeLessThan(
      actionsRow.indexOf('aria-label="Stop checking"'),
    );
    expect(actionsRow.indexOf('aria-label="Stop checking"')).toBeLessThan(
      actionsRow.indexOf('{evidence.label}'),
    );
  });

  it('shows the pinned execution identity as populated, uneditable fields', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: { descriptor, host, sessionStore },
    });

    expect(body).toMatch(
      /Workflow ID[\s\S]*value="order-lifecycle-01"[\s\S]*disabled/,
    );
    expect(body).toMatch(/Task Queue[\s\S]*value="catalog-tasks"/);
    expect(body).toMatch(/Workflow Type[\s\S]*value="OrderLifecycle"/);
  });

  it('marks a generated execution id instead of showing an empty field', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: {
        descriptor: {
          ...descriptor,
          startOptions: { defaultValue: {}, schema: { type: 'object' } },
        },
        host,
        sessionStore,
      },
    });

    expect(body).toContain('Generated for each run');
  });

  it('keeps drafts and sessions scoped to the selected example and target', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain('sessionStore.getDraft(descriptor.id)');
    expect(source).toContain('sessionStore.setDraft(descriptor.id');
    expect(source).toContain('catalogTargetFingerprint');
    expect(source).toContain('PayloadInput');
    expect(source).toContain('catalog-start-options');
    expect(source).toContain('sticky bottom-0');
    expect(source).toContain('configureOpen = false');
  });

  it('presents capability tags and verification guidance as passive metadata', () => {
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(source).toContain('descriptor.capabilityTags');
    expect(source).toContain('descriptor.expectedEvidence');
    expect(source).toContain('What to verify');
  });

  it('uses human-readable names for every execution kind', () => {
    const sessionStore = createCatalogSessionStore(host);
    const activityDescriptor: BrowserCatalogDescriptor = {
      ...descriptor,
      capabilityTags: ['Standalone Activity'],
      execution: {
        kind: 'standalone-activity',
        targetId: 'catalog',
        namespace: 'default',
        taskQueue: 'catalog-tasks',
        activityType: 'CreateOrder',
        timeouts: {},
        policies: {},
      },
    };
    const nexusDescriptor: BrowserCatalogDescriptor = {
      ...descriptor,
      capabilityTags: [],
      execution: {
        kind: 'standalone-nexus-operation',
        targetId: 'catalog',
        namespace: 'default',
        taskQueue: 'catalog-tasks',
        endpoint: 'orders',
        service: 'OrderService',
        operation: 'create',
        policies: {},
      },
    };

    expect(
      renderComponent(catalogDetail, {
        props: { descriptor, host, sessionStore },
      }).body,
    ).toContain('>Workflow<');
    const activityBody = renderComponent(catalogDetail, {
      props: { descriptor: activityDescriptor, host, sessionStore },
    }).body;
    expect(activityBody).toContain('Standalone Activity');
    expect(activityBody.match(/Standalone Activity/g)).toHaveLength(1);
    expect(
      renderComponent(catalogDetail, {
        props: { descriptor: nexusDescriptor, host, sessionStore },
      }).body,
    ).toContain('Standalone Nexus Operation');
  });

  it('explains empty verification guidance and status-check actions plainly', () => {
    const sessionStore = createCatalogSessionStore(host);
    const { body } = renderComponent(catalogDetail, {
      props: {
        descriptor: { ...descriptor, expectedEvidence: [] },
        host,
        sessionStore,
      },
    });
    const source = readFileSync(
      resolve('src/lib/catalog/browser/catalog-detail.svelte'),
      'utf8',
    );

    expect(body).toContain('Nothing to verify was specified.');
    expect(source).toContain("'launch-rejected': 'Start failed'");
    expect(source).toContain("'launch-uncertain': 'Start not confirmed'");
    expect(source).toContain("'observation-paused': 'Status checks paused'");
    expect(source).toContain("stopped: 'Status checks stopped'");
    expect(source).toContain('aria-label="Resume checking"');
    expect(source).toContain('aria-label="Stop checking"');
    expect(source).toContain(
      'A required service is unavailable. Check Readiness and try again.',
    );
    expect(source).toContain(
      'This example couldn’t be started. Check Readiness and try again.',
    );
  });
});
