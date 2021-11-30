import type { WorkflowExecution } from '../models/workflow-execution';
import { getWorkflowExecutionUrl } from './get-workflow-execution-url';

describe(getWorkflowExecutionUrl, () => {
  it('should display a workflow URL with just the workflow information', () => {
    const workflow = { id: 'id', runId: 'run' } as WorkflowExecution;

    expect(getWorkflowExecutionUrl('default', workflow)).toBe(
      '/namespaces/default/workflows/id/run',
    );
  });
});
