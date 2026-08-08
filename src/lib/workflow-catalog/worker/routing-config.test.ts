import { describe, expect, it } from 'vitest';

import {
  requireWorkflowCatalogRoutingFromEnvironment,
  workflowCatalogRoutingFromEnvironment,
} from './routing-config';

describe('workflowCatalogRoutingFromEnvironment', () => {
  it('routes the shared target to the configured namespace by default', () => {
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

  it('routes every registered target to the configured namespace with its registered task queue', () => {
    expect(
      workflowCatalogRoutingFromEnvironment(
        { TEMPORAL_NAMESPACE: 'runtime-namespace' },
        [
          { targetId: 'shared-workflows', taskQueue: 'ui-workflow-catalog' },
          { targetId: 'local-workflows', taskQueue: 'local-queue' },
        ],
      ),
    ).toEqual({
      'shared-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'ui-workflow-catalog',
      },
      'local-workflows': {
        namespace: 'runtime-namespace',
        taskQueue: 'local-queue',
      },
    });
  });

  it('keeps registered routing when no runtime namespace is configured', () => {
    expect(workflowCatalogRoutingFromEnvironment({})).toEqual({});
    expect(
      workflowCatalogRoutingFromEnvironment({}, [
        { targetId: 'local-workflows', taskQueue: 'local-queue' },
      ]),
    ).toEqual({});
  });

  it('requires a runtime namespace for the workflow catalog worker', () => {
    expect(() => requireWorkflowCatalogRoutingFromEnvironment({})).toThrowError(
      'TEMPORAL_NAMESPACE is required',
    );
  });
});
