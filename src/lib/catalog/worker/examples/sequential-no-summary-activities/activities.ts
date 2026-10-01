export async function recordActivityWithoutSummary(
  index: number,
): Promise<string> {
  return `Completed activity ${index}`;
}
