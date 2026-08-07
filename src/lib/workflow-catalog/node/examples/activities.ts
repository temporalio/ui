import { Context } from '@temporalio/activity';

export { greet, processData } from './shared-activities.js';

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function timeoutActivity(
  startedAt: number,
  shouldTimeout = true,
): Promise<string> {
  await wait(shouldTimeout ? 5000 : 500);
  return `Timeout activity completed. Started at: ${startedAt}`;
}

export async function retryActivity(
  failuresBeforeSuccess = 2,
): Promise<string> {
  const attempt = Context.current().info.attempt;

  if (attempt <= failuresBeforeSuccess) {
    throw new Error(`Retry attempt ${attempt} failed - will retry`);
  }

  return `Retry activity succeeded on attempt ${attempt}`;
}

export async function heartbeatActivity(
  totalSteps: number,
  stepDelay = 1000,
): Promise<string> {
  for (let step = 1; step <= totalSteps; step += 1) {
    await wait(stepDelay);
    Context.current().heartbeat({ progress: step, total: totalSteps });
  }

  return `Heartbeat activity completed ${totalSteps} steps`;
}

export async function signalActivity(
  workflowId: string,
  signalName: string,
  signalValue: unknown,
): Promise<string> {
  return `Signal received by workflow ${workflowId} with signal ${signalName} and value ${JSON.stringify(signalValue)}`;
}

export async function processItem(item: string): Promise<string> {
  await wait(100);
  return `Processed: ${item.toUpperCase()}`;
}

export async function generateSummary(
  itemCount: number,
  completedBy: string,
): Promise<string> {
  await wait(50);
  return `Collected ${itemCount} item(s), completed by: ${completedBy}`;
}
