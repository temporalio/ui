import { startChild, workflowInfo } from '@temporalio/workflow';

import { hello } from '../hello/workflow.js';
import { highEventCountWorkflow } from '../high-event-count/workflow.js';
import { parallelActivities } from '../parallel-activities/workflow.js';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function childWorkflowTest(): Promise<string> {
  const parentWorkflowId = workflowInfo().workflowId;
  try {
    const child1 = await startChild(hello, {
      args: ['Child1'],
      workflowId: `child-${parentWorkflowId}-1`,
    });
    const child2 = await startChild(parallelActivities, {
      args: [`child-data-${Date.now()}`],
      workflowId: `child-${parentWorkflowId}-2`,
    });
    const child3 = await startChild(highEventCountWorkflow, {
      args: [7],
      workflowId: `child-${parentWorkflowId}-high-events`,
    });
    const [result1, result2, result3] = await Promise.all([
      child1.result(),
      child2.result(),
      child3.result(),
    ]);
    return `CHILD WORKFLOWS SUCCESS: Child1: ${result1}, Child2: ${result2}, Child3: ${result3}`;
  } catch (error) {
    return `CHILD WORKFLOWS FAILURE: ${errorMessage(error)}`;
  }
}
