import { ApplicationFailure, sleep } from '@temporalio/workflow';

export type Outcome = 'complete' | 'fail' | 'run';

export type DemoInput = {
  outcome: Outcome;
  /** How long a running workflow stays open, in seconds. */
  openSeconds: number;
};

/** Each step adds a timer and a workflow task, so a history review has routine rows to hide. */
const PROCESSING_STEPS = 6;

const finish = async ({ outcome, openSeconds }: DemoInput) => {
  if (outcome === 'run') {
    await sleep(openSeconds * 1000);
    return 'closed after staying open';
  }
  for (let step = 0; step < PROCESSING_STEPS; step++) {
    await sleep(150);
  }
  if (outcome === 'fail') {
    throw ApplicationFailure.nonRetryable(
      'The demo workflow failed on purpose',
    );
  }
  return 'completed';
};

export async function AgentSessionWorkflow(input: DemoInput): Promise<string> {
  return finish(input);
}

export async function OrderWorkflow(input: DemoInput): Promise<string> {
  return finish(input);
}

export async function RefundWorkflow(input: DemoInput): Promise<string> {
  return finish(input);
}
