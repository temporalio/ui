import { flushSync as flushSvelte, mount, tick, unmount } from 'svelte';

import { createWorkflowCatalogSessionStore } from './session-store';
import type { BrowserWorkflowCatalogDescriptor } from './types';
import type {
  ReadinessCheck,
  StartCommand,
  WorkbenchHost,
} from './workbench-host';

import CatalogDetail from './catalog-detail.svelte';
import CatalogList from './catalog-list.svelte';

const descriptor: BrowserWorkflowCatalogDescriptor = {
  id: 'order-lifecycle',
  source: 'shared',
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
    schema: {
      type: 'object',
      properties: { workflowId: { type: 'string' } },
    },
  },
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'default',
    taskQueue: 'catalog-tasks',
    workflowType: 'OrderLifecycle',
  },
};

const localDescriptor: BrowserWorkflowCatalogDescriptor = {
  ...descriptor,
  id: 'payment-reminder',
  source: 'local',
  title: 'Payment reminder',
  description: 'Send a local payment reminder.',
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'default',
    taskQueue: 'catalog-tasks',
    workflowType: 'PaymentReminder',
  },
};

const mounted: ReturnType<typeof mount>[] = [];
let resolvePendingReadiness: ((checks: ReadinessCheck[]) => void) | undefined;
let readinessCallCount = 0;
let startPromise: Promise<StartCommand> | undefined;
let resolveStart: ((command: StartCommand) => void) | undefined;

const prepareStartPromise = () => {
  startPromise = new Promise((resolve) => {
    resolveStart = resolve;
  });
};

const createHost = (
  checkReadiness: WorkbenchHost['checkReadiness'],
): WorkbenchHost => ({
  start: async (command) => {
    resolveStart?.(command);
    return {
      status: 'accepted',
      reference: {
        exampleId: command.exampleId,
        kind: descriptor.execution.kind,
        attempt: command.attempt,
        target: descriptor.execution,
        runId: 'run-1',
      },
    };
  },
  checkReadiness,
  observe: async () => ({
    state: 'terminal',
    status: 'completed',
    snapshot: {},
  }),
  evidenceLink: () => ({
    href: '/workflows/order-lifecycle/run-1',
    label: 'Workflow details',
  }),
});

export async function cleanup() {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  resolvePendingReadiness = undefined;
  readinessCallCount = 0;
  startPromise = undefined;
  resolveStart = undefined;
  document.body.replaceChildren();
}

export async function renderDetail({
  deferReadiness = false,
  readinessResponses = [
    [
      {
        kind: 'worker',
        required: false,
        state: 'ready',
        taskQueueType: 1,
      },
    ],
  ],
}: {
  deferReadiness?: boolean;
  readinessResponses?: ReadinessCheck[][];
} = {}) {
  readinessCallCount = 0;
  let readinessResponseIndex = 0;
  prepareStartPromise();
  const host = createHost(() => {
    readinessCallCount += 1;
    return deferReadiness
      ? new Promise((resolve) => {
          resolvePendingReadiness = resolve;
        })
      : Promise.resolve(
          readinessResponses[
            Math.min(readinessResponseIndex++, readinessResponses.length - 1)
          ] ?? [],
        );
  });
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(CatalogDetail, {
      target,
      props: {
        descriptor,
        host,
        sessionStore: createWorkflowCatalogSessionStore(host),
      },
    }),
  );
  flushSvelte();
  await Promise.resolve();
  return target;
}

export async function resolveReadiness(checks: ReadinessCheck[]) {
  resolvePendingReadiness?.(checks);
  await tick();
  await tick();
  flushSvelte();
}

export async function renderList() {
  readinessCallCount = 0;
  prepareStartPromise();
  const host = createHost(async () => {
    readinessCallCount += 1;
    return [
      {
        kind: 'worker',
        required: false,
        state: 'ready',
        taskQueueType: 1,
      },
    ];
  });
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(CatalogList, {
      target,
      props: {
        descriptors: [descriptor, localDescriptor],
        host,
        sessionStore: createWorkflowCatalogSessionStore(host),
      },
    }),
  );
  flushSvelte();
  await Promise.resolve();
  return target;
}

export async function flush() {
  await tick();
  await tick();
  flushSvelte();
}

export function flushSync() {
  flushSvelte();
}

export function getReadinessCallCount() {
  return readinessCallCount;
}

export function waitForStart() {
  if (!startPromise) throw new Error('Render the detail before waiting');
  return startPromise;
}
