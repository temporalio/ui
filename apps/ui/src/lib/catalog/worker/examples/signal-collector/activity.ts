const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
export async function processItem(item: string): Promise<string> {
  await wait(100);
  return `Processed: ${item.toUpperCase()}`;
}
export async function generateSummary(
  itemCount: number,
  completedBy: string,
): Promise<string> {
  await wait(50);
  return `Collected ${itemCount} item(s), completed by: ${completedBy}`;
}
