import { Context } from '@temporalio/activity';

export async function recordTimelineStep(step: string): Promise<string> {
  return `Recorded ${step}`;
}

export async function retryTimelineStep(step: string): Promise<string> {
  if (Context.current().info.attempt === 1) {
    throw new Error(`Expected first attempt failure for ${step}`);
  }
  return `Retried ${step} successfully`;
}

export async function recordLocalTimelineStep(step: string): Promise<string> {
  return `Recorded local step ${step}`;
}
