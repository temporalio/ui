import type { WorkflowExecution } from '../models/workflow-execution';
import { getWorkflowExecutionUrl } from './get-workflow-execution-url';

describe(getWorkflowExecutionUrl, () => {
  it('should display a workflow URL with just the workflow information', () => {
    const workflow = { id: 'id', runId: 'run' } as WorkflowExecution;

    expect(getWorkflowExecutionUrl('default', workflow)).toBe(
      '/namespaces/default/workflows/id/run',
    );
  });

  it('should display a workflow URL with query params', () => {
    const workflow = { id: 'id', runId: 'run' } as WorkflowExecution;
    const query = new URLSearchParams({ fullScreen: 'true' });

    expect(getWorkflowExecutionUrl('default', workflow, query)).toBe(
      '/namespaces/default/workflows/id/run?fullScreen=true',
    );
  });

  it('should display a workflow URL with overiding query params', () => {
    const workflow = { id: 'id', runId: 'run' } as WorkflowExecution;
    const query = new URLSearchParams({ a: '1', b: '2' });
    const overrides = new URLSearchParams({ b: '3' });

    expect(getWorkflowExecutionUrl('default', workflow, query, overrides)).toBe(
      '/namespaces/default/workflows/id/run?a=1&b=3',
    );
  });
});
