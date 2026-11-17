import { ApplicationFailure, Context } from '@temporalio/activity';

const FLAKY_FAILURES = 2;

export async function flakyStep(run: number): Promise<string> {
  const attempt = Context.current().info.attempt;

  if (attempt <= FLAKY_FAILURES) {
    throw new Error(`Run ${run} flaky step failed on attempt ${attempt}`);
  }

  return `Run ${run} flaky step succeeded on attempt ${attempt}`;
}

export async function brokenStep(run: number): Promise<string> {
  throw ApplicationFailure.nonRetryable(`Run ${run} broken step always fails`);
}

export async function busyStep(index: number): Promise<number> {
  return index;
}
