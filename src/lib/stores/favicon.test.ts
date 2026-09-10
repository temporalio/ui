import { get } from 'svelte/store';
import { afterEach, describe, expect, it } from 'vitest';

import { statusFavicon } from '$lib/stores/favicon';
import { initialWorkflowRun, workflowRun } from '$lib/stores/workflow-run';
import type { WorkflowExecution } from '$lib/types/workflows';
import { getWorkflowStatusFavicon } from '$lib/utilities/get-workflow-status-favicon';

const runWithStatus = (status: WorkflowExecution['status']) => ({
  ...initialWorkflowRun,
  workflow: { status } as WorkflowExecution,
});

describe('statusFavicon', () => {
  afterEach(() => {
    workflowRun.set(initialWorkflowRun);
  });

  it('follows the status of the workflow being viewed', () => {
    workflowRun.set(runWithStatus('Running'));
    expect(get(statusFavicon)).toBe(getWorkflowStatusFavicon('Running'));

    workflowRun.set(runWithStatus('Failed'));
    expect(get(statusFavicon)).toBe(getWorkflowStatusFavicon('Failed'));
  });

  it('has no icon of its own once the workflow run is cleared', () => {
    workflowRun.set(runWithStatus('Completed'));
    workflowRun.set(initialWorkflowRun);

    expect(get(statusFavicon)).toBeUndefined();
  });
});
