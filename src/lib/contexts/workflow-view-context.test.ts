import { describe, expect, it } from 'vitest';

import type { WorkflowExecution } from '$lib/types/workflows';

import { workflowIdentity } from './workflow-view-context';

describe('workflowIdentity', () => {
  const params = { namespace: 'default', workflow: 'route-wf', run: 'route' };

  it('uses the route outside an embedded run', () => {
    expect(workflowIdentity(undefined, params)).toEqual(params);
  });

  it('uses the embedded run when one is provided', () => {
    expect(
      workflowIdentity(
        {
          namespace: 'other',
          workflow: { id: 'wf', runId: 'selected' } as WorkflowExecution,
          events: [],
        },
        params,
      ),
    ).toEqual({ namespace: 'other', workflow: 'wf', run: 'selected' });
  });
});
