import { Context } from '@temporalio/activity';

export async function retryActivity(
  failuresBeforeSuccess = 2,
): Promise<string> {
  const attempt = Context.current().info.attempt;

  if (attempt <= failuresBeforeSuccess) {
    throw new Error(`Retry attempt ${attempt} failed - will retry`);
  }

  return `Retry activity succeeded on attempt ${attempt}`;
}
