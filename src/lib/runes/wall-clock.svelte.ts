import { createSubscriber } from 'svelte/reactivity';

export function createWallClock(intervalMs = 1000): () => number {
  const subscribe = createSubscriber((update) => {
    const interval = setInterval(update, intervalMs);
    return () => clearInterval(interval);
  });

  return () => {
    subscribe();
    return Date.now();
  };
}
