import { Context } from '@temporalio/activity';

export async function longSleep(durationMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < durationMs) {
    const remaining = durationMs - (Date.now() - start);
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(30_000, remaining)),
    );
    Context.current().heartbeat({ elapsedMs: Date.now() - start, durationMs });
  }
}

export async function alwaysFails(attempt: number): Promise<void> {
  throw new Error(
    `Activity failed on attempt ${attempt} (intentional for retry testing)`,
  );
}
