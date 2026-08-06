import { describe, expect, it } from 'vitest';

import {
  requireWorkflowCatalogRoutingFromEnvironment,
  workflowCatalogRoutingFromEnvironment,
} from './routing-config';

describe('workflowCatalogRoutingFromEnvironment', () => {
  it('routes shared workflows to the configured namespace and default task queue', () => {
    expect(
      workflowCatalogRoutingFromEnvironment({
        TEMPORAL_NAMESPACE: 'runtime-namespace',
      }),
    ).toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'ui-workflow-catalog',
      },
    });
  });

  it('routes shared workflows to an explicitly configured task queue', () => {
    expect(
      workflowCatalogRoutingFromEnvironment({
        TEMPORAL_NAMESPACE: 'runtime-namespace',
        TEMPORAL_TASK_QUEUE: 'runtime-task-queue',
      }),
    ).toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'runtime-task-queue',
      },
    });
  });

  it('uses the default task queue when the configured task queue is empty', () => {
    expect(
      workflowCatalogRoutingFromEnvironment({
        TEMPORAL_NAMESPACE: 'runtime-namespace',
        TEMPORAL_TASK_QUEUE: '',
      }),
    ).toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'ui-workflow-catalog',
      },
    });
  });

  it('keeps registered routing when no runtime namespace is configured', () => {
    expect(workflowCatalogRoutingFromEnvironment({})).toEqual({});
  });

  it('requires a runtime namespace for the workflow catalog worker', () => {
    expect(() => requireWorkflowCatalogRoutingFromEnvironment({})).toThrowError(
      'TEMPORAL_NAMESPACE is required',
    );
  });
});
