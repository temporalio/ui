import { Context } from '@temporalio/activity';

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function greet(name: string): Promise<string> {
  return `Guten tag ${name}!`;
}

export async function processData(
  dataId: string,
  delay = 1000,
  modulo = 7,
): Promise<string> {
  const startTime = Date.now();
  await wait(delay + Math.random() * 2000);

  const checkTime = Date.now();
  if (checkTime % modulo !== 0) {
    throw new Error(
      `ProcessDataA failed for ${dataId}: timestamp ${checkTime} % ${modulo} = ${checkTime % modulo} (not 0)`,
    );
  }

  const duration = Math.round((checkTime - startTime) / 1000);
  return `ProcessDataA-${dataId}-success-${duration}s`;
}

export async function processLongData(delay = 60000): Promise<string> {
  await wait(delay);
  return `Long activity completed after ${delay} ms`;
}

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
