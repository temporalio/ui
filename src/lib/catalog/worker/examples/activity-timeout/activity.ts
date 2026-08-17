const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function timeoutActivity(
  startedAt: number,
  shouldTimeout = true,
): Promise<string> {
  await wait(shouldTimeout ? 5000 : 500);
  return `Timeout activity completed. Started at: ${startedAt}`;
}
