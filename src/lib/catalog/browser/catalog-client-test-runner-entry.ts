import { EditorView } from '@codemirror/view';
import { flushSync as flushSvelte, mount, tick, unmount } from 'svelte';

import {
  getGotoCalls as getMockGotoCalls,
  resetNavigationMocks,
  triggerBeforeNavigate as triggerMockBeforeNavigate,
} from '$lib/svelte-mocks/app/navigation';

import type { CatalogAuthoringHost } from './catalog-authoring-host';
import type {
  CatalogPromotionOutcome,
  CatalogPromotionPreview,
  CatalogSaveRequest,
  CatalogSaveTerminalOutcome,
} from './catalog-authoring-host';
import { createCatalogSessionStore } from './session-store';
import type { BrowserCatalogDescriptor } from './types';
import type {
  ReadinessCheck,
  StartCommand,
  WorkbenchHost,
} from './workbench-host';

import CatalogCreate from './catalog-create.svelte';
import CatalogDetail from './catalog-detail.svelte';
import CatalogList from './catalog-list.svelte';

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

const localDescriptor: BrowserCatalogDescriptor = {
  ...descriptor,
  id: 'payment-reminder',
  source: { id: 'local', label: 'Local' },
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

const cloudDescriptor: BrowserCatalogDescriptor = {
  ...descriptor,
  id: 'cloud-example',
  source: { id: 'cloud', label: 'Cloud' },
  title: 'Cloud example',
  description: 'Runs a Cloud example.',
};

const mounted: ReturnType<typeof mount>[] = [];
let resolvePendingReadiness: ((checks: ReadinessCheck[]) => void) | undefined;
let readinessCallCount = 0;
let startPromise: Promise<StartCommand> | undefined;
let resolveStart: ((command: StartCommand) => void) | undefined;
let scaffoldedIds: string[] = [];
let loadedIds: string[] = [];
let saveRequests: CatalogSaveRequest[] = [];
let promotionPreviewInputs: Parameters<
  CatalogAuthoringHost['previewPromote']
>[0][] = [];
let promotionConfirmInputs: Parameters<
  CatalogAuthoringHost['confirmPromote']
>[0][] = [];
let inspectedOperationIds: string[] = [];

const authoringExample = {
  id: 'payment-reminder',
  sourceFiles: [
    {
      content: 'export const workflow = true;\n',
      editable: true,
      mode: 0o644,
      path: 'workflow.ts',
    },
    {
      content: 'export const example = true;\n',
      editable: true,
      mode: 0o644,
      path: 'example.ts',
    },
  ],
  sourceSnapshot: {
    baseRevision: 'revision-1',
    limits: {
      maxDepth: 8,
      maxFileBytes: 262144,
      maxFiles: 64,
      maxTotalBytes: 1048576,
    },
  },
} satisfies Awaited<ReturnType<CatalogAuthoringHost['load']>>;

const createAuthoringHost = (
  saveOutcome?: CatalogSaveTerminalOutcome,
  promotionPreview?: CatalogPromotionPreview,
  promotionOutcome?: CatalogPromotionOutcome,
): CatalogAuthoringHost => ({
  available: true,
  scaffold: async (exampleId) => {
    scaffoldedIds.push(exampleId);
  },
  load: async (exampleId) => {
    loadedIds.push(exampleId);
    return { ...authoringExample, id: exampleId };
  },
  save: (request, onEvent) => {
    saveRequests.push(request);
    if (saveOutcome) {
      const terminal = {
        kind: 'terminal' as const,
        operationId: request.operationId,
        sequence: 1,
        outcome: saveOutcome,
        ownership: 'released' as const,
        reload: 'none' as const,
      };
      onEvent(terminal);
      return Promise.resolve(terminal);
    }
    onEvent({
      kind: 'check',
      operationId: request.operationId,
      sequence: 1,
      step: 'write_files',
      severity: 'blocking',
      state: 'passed',
      reason: 'Files written.',
    });
    onEvent({
      kind: 'check',
      operationId: request.operationId,
      sequence: 2,
      step: 'verify',
      severity: 'blocking',
      state: 'not-reached',
      reason: 'An earlier check failed.',
    });
    return new Promise(() => undefined);
  },
  inspectSaveOperation: async (operationId) => {
    inspectedOperationIds.push(operationId);
    return undefined;
  },
  subscribeSaveOperation: () => () => undefined,
  previewPromote: async (input) => {
    promotionPreviewInputs.push(input);
    return (
      promotionPreview ?? { status: 'unavailable', reason: 'unsaved-changes' }
    );
  },
  confirmPromote: async (input) => {
    promotionConfirmInputs.push(input);
    return (
      promotionOutcome ?? {
        status: 'refused',
        direction: 'promote',
        reason: 'save-state-changed',
        detail: 'Not saved.',
      }
    );
  },
});

const ensureDialogMethods = () => {
  const prototype = HTMLDialogElement.prototype;
  if (!prototype.showModal) {
    prototype.showModal = function () {
      this.open = true;
    };
  }
  if (!prototype.close) {
    prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  }
};

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
  scaffoldedIds = [];
  loadedIds = [];
  saveRequests = [];
  promotionPreviewInputs = [];
  promotionConfirmInputs = [];
  inspectedOperationIds = [];
  resetNavigationMocks();
  document.body.replaceChildren();
}

export async function renderCreate({
  exampleHref,
  promotionOutcome,
  promotionPreview,
  saveOutcome,
}: {
  exampleHref?: string;
  promotionOutcome?: CatalogPromotionOutcome;
  promotionPreview?: CatalogPromotionPreview;
  saveOutcome?: CatalogSaveTerminalOutcome;
} = {}) {
  ensureDialogMethods();
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(CatalogCreate, {
      target,
      props: {
        exampleHref,
        host: createAuthoringHost(
          saveOutcome,
          promotionPreview,
          promotionOutcome,
        ),
      },
    }),
  );
  flushSvelte();
  await Promise.resolve();
  return target;
}

export function getScaffoldedIds() {
  return [...scaffoldedIds];
}

export function getLoadedIds() {
  return [...loadedIds];
}

export function getInspectedOperationIds() {
  return [...inspectedOperationIds];
}

export function getSaveRequests() {
  return structuredClone(saveRequests);
}

export function getPromotionPreviewInputs() {
  return structuredClone(promotionPreviewInputs);
}

export function getPromotionConfirmInputs() {
  return structuredClone(promotionConfirmInputs);
}

export function triggerNavigation(to: string) {
  return triggerMockBeforeNavigate(to);
}

export function getNavigationCalls() {
  return getMockGotoCalls();
}

export async function renderDetail({
  deferReadiness = false,
  pinExecutionId = true,
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
  pinExecutionId?: boolean;
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
        descriptor: pinExecutionId
          ? descriptor
          : {
              ...descriptor,
              startOptions: { ...descriptor.startOptions, defaultValue: {} },
            },
        host,
        sessionStore: createCatalogSessionStore(host),
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

export async function renderList({
  exampleHref = (exampleId: string) => `/examples/${exampleId}`,
}: {
  exampleHref?: (exampleId: string) => string;
} = {}) {
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
        descriptors: [descriptor, localDescriptor, cloudDescriptor],
        host,
        sessionStore: createCatalogSessionStore(host),
        exampleHref,
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

export function replaceEditorContent(
  target: HTMLElement,
  label: string,
  content: string,
) {
  const editor = target.querySelector<HTMLElement>(`[aria-label="${label}"]`);
  const view = editor ? EditorView.findFromDOM(editor) : null;
  if (!view) throw new Error(`Editor not found: ${label}`);
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: content },
  });
  flushSvelte();
}

export function getReadinessCallCount() {
  return readinessCallCount;
}

export function waitForStart() {
  if (!startPromise) throw new Error('Render the detail before waiting');
  return startPromise;
}
