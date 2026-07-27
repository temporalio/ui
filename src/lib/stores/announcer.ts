import { type Readable, readonly, writable } from 'svelte/store';

export type Politeness = 'polite' | 'assertive';

export interface Announcement {
  id: string;
  message: string;
  politeness: Politeness;
}

export interface Announcer {
  messages: Readable<Announcement[]>;
  announce: (
    message: string,
    politeness?: Politeness,
    duration?: number,
  ) => void;
  clear: () => void;
}

const DEFAULT_TIMEOUT = 7000;

export function createAnnouncer(options: { timeout?: number } = {}): Announcer {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const messages = writable<Announcement[]>([]);
  const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

  const announce = (
    message: string,
    politeness: Politeness = 'polite',
    duration?: number,
  ) => {
    const id = crypto.randomUUID();
    const delay = Math.max(duration ?? 0, timeout);
    messages.update((current) => [...current, { id, message, politeness }]);
    const handle = setTimeout(() => {
      messages.update((current) => current.filter((m) => m.id !== id));
      pendingTimers.delete(handle);
    }, delay);
    pendingTimers.add(handle);
  };

  const clear = () => {
    for (const handle of pendingTimers) {
      clearTimeout(handle);
    }
    pendingTimers.clear();
    messages.set([]);
  };

  return {
    messages: readonly(messages),
    announce,
    clear,
  };
}
