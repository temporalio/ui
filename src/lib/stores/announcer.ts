import { type Readable, writable } from 'svelte/store';

export type Politeness = 'polite' | 'assertive';

export interface Announcement {
  id: string;
  message: string;
  politeness: Politeness;
}

export interface Announcer {
  messages: Readable<Announcement[]>;
  announce: (message: string, politeness?: Politeness) => void;
  clear: () => void;
}

const DEFAULT_TIMEOUT = 7000;

export function createAnnouncer(options: { timeout?: number } = {}): Announcer {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const messages = writable<Announcement[]>([]);

  const announce = (message: string, politeness: Politeness = 'polite') => {
    const id = crypto.randomUUID();
    messages.update((current) => [...current, { id, message, politeness }]);
    setTimeout(() => {
      messages.update((current) => current.filter((m) => m.id !== id));
    }, timeout);
  };

  const clear = () => messages.set([]);

  return {
    messages: { subscribe: messages.subscribe },
    announce,
    clear,
  };
}
