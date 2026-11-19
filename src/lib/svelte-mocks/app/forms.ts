export function applyAction(): Promise<void> {
  return Promise.resolve();
}

export function deserialize<T>(result: string): T {
  return JSON.parse(result);
}

export function enhance(): { destroy: () => void } {
  return { destroy: () => {} };
}
