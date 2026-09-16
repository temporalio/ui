import { Context } from '@temporalio/activity';

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

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
