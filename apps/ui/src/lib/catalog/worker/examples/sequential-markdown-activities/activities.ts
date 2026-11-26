import { Context } from '@temporalio/activity';

const RETRYING_STEP = 10;
const FAILURES_BEFORE_SUCCESS = 3;

export async function logStep(step: number): Promise<string> {
  const attempt = Context.current().info.attempt;

  if (step === RETRYING_STEP && attempt <= FAILURES_BEFORE_SUCCESS) {
    throw new Error(`Logging step ${step} failed on attempt ${attempt}`);
  }

  return `Completed logging step ${step}`;
}
