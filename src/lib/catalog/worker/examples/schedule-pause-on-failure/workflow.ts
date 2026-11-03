import { ApplicationFailure } from '@temporalio/workflow';

export async function schedulePauseOnFailure(
  message = 'Intentional scheduled failure',
): Promise<never> {
  throw ApplicationFailure.nonRetryable(message, 'ScheduledDemoFailure');
}
