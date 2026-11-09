import { describe, expect, expectTypeOf, it } from 'vitest';

import type { BrowserCatalogDescriptor } from './types';
import {
  catalogStartAllowed,
  createAttemptIdentity,
  type ExecutionTerminalStatus,
  type ObservationRequest,
  type StartCommand,
} from './workbench-host';

const workflowDescriptor: Pick<BrowserCatalogDescriptor, 'execution'> = {
  execution: {
    kind: 'workflow',
    namespace: 'catalog-demo',
    targetId: 'catalog',
    taskQueue: 'catalog-tasks',
    workflowType: 'CatalogWorkflow',
  },
};

const activityDescriptor: Pick<BrowserCatalogDescriptor, 'execution'> = {
  execution: {
    kind: 'standalone-activity',
    namespace: 'catalog-demo',
    targetId: 'catalog',
    taskQueue: 'catalog-tasks',
    activityType: 'CatalogActivity',
    timeouts: {},
    policies: {},
  },
};

const nexusDescriptor: Pick<BrowserCatalogDescriptor, 'execution'> = {
  execution: {
    kind: 'standalone-nexus-operation',
    namespace: 'catalog-demo',
    targetId: 'catalog',
    taskQueue: 'catalog-tasks',
    endpoint: 'catalog-endpoint',
    service: 'CatalogService',
    operation: 'catalogOperation',
    policies: {},
  },
};

const policy = {
  disableWriteActions: false,
  workflowStartsDisabled: false,
  namespaceWriteDisabled: () => false,
};

describe('catalogStartAllowed', () => {
  it('denies starts when global write actions are disabled', () => {
    expect(
      catalogStartAllowed(workflowDescriptor, {
        ...policy,
        disableWriteActions: true,
      }),
    ).toBe(false);
  });

  it('denies workflow starts when workflow creation is disabled', () => {
    expect(
      catalogStartAllowed(workflowDescriptor, {
        ...policy,
        workflowStartsDisabled: true,
      }),
    ).toBe(false);
  });

  it('denies starts when the target namespace is write disabled', () => {
    expect(
      catalogStartAllowed(workflowDescriptor, {
        ...policy,
        namespaceWriteDisabled: (namespace) => namespace === 'catalog-demo',
      }),
    ).toBe(false);
  });

  it('allows standalone Activity starts when only workflow creation is disabled', () => {
    expect(
      catalogStartAllowed(activityDescriptor, {
        ...policy,
        workflowStartsDisabled: true,
      }),
    ).toBe(true);
  });

  it('denies standalone Activity starts when global write actions are disabled', () => {
    expect(
      catalogStartAllowed(activityDescriptor, {
        ...policy,
        disableWriteActions: true,
      }),
    ).toBe(false);
  });

  it('allows standalone Nexus starts when only workflow creation is disabled', () => {
    expect(
      catalogStartAllowed(nexusDescriptor, {
        ...policy,
        workflowStartsDisabled: true,
      }),
    ).toBe(true);
  });

  it('denies standalone Nexus starts when the target namespace is write disabled', () => {
    expect(
      catalogStartAllowed(nexusDescriptor, {
        ...policy,
        namespaceWriteDisabled: (namespace) => namespace === 'catalog-demo',
      }),
    ).toBe(false);
  });
});

describe('createAttemptIdentity', () => {
  it('creates the attempt and Temporal execution identities before dispatch', () => {
    const ids = ['attempt-uuid', 'execution-uuid'];

    expect(createAttemptIdentity(() => ids.shift() ?? '')).toEqual({
      attemptId: 'attempt-uuid',
      executionId: 'execution-uuid',
    });
  });

  it('keeps registered routing out of editable start commands', () => {
    expectTypeOf<StartCommand>().not.toHaveProperty('namespace');
    expectTypeOf<StartCommand>().not.toHaveProperty('taskQueue');
    expectTypeOf<StartCommand>().not.toHaveProperty('workflowType');
    expectTypeOf<StartCommand>().not.toHaveProperty('endpoint');
    expectTypeOf<StartCommand>().not.toHaveProperty('service');
    expectTypeOf<StartCommand>().not.toHaveProperty('operation');
  });

  it('observes only accepted references and keeps continuation provider-neutral', () => {
    expectTypeOf<ObservationRequest['reference']>().toHaveProperty('runId');
    expectTypeOf<ObservationRequest['continuation']>().not.toBeFunction();
    expectTypeOf<'continued-as-new'>().toMatchTypeOf<ExecutionTerminalStatus>();
  });
});
