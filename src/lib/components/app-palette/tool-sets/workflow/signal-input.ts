// An empty input sends the signal with no arguments.
export function isValidSignalInput(input: string): boolean {
  if (!input.trim()) return true;
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

export function signalNames(
  definitions: readonly { name?: string }[] | undefined,
): string[] {
  const names = (definitions ?? []).flatMap(({ name }) => (name ? [name] : []));
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}
