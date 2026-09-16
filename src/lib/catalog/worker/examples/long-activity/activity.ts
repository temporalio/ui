const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function processLongData(delay = 60000): Promise<string> {
  await wait(delay);
  return `Long activity completed after ${delay} ms`;
}
