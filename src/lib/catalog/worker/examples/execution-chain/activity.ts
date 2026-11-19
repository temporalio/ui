import { ApplicationFailure, Context } from '@temporalio/activity';

const FLAKY_FAILURES = 2;

export async function flakyStep(runIndex: number): Promise<string> {
  const attempt = Context.current().info.attempt;

  if (attempt <= FLAKY_FAILURES) {
    throw new Error(
      `Run index ${runIndex} flaky step failed on attempt ${attempt}`,
    );
  }

  return `Run index ${runIndex} flaky step succeeded on attempt ${attempt}`;
}

export async function brokenStep(runIndex: number): Promise<string> {
  throw ApplicationFailure.nonRetryable(
    `Run index ${runIndex} broken step always fails`,
  );
}

export async function busyStep(index: number): Promise<number> {
  return index;
}
