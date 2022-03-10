import { writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';

type NotificationType = 'error' | 'warning' | 'success' | 'information';
type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  expiration: number;
};
type Notifications = Notification[];

const whenIdle = globalThis?.requestIdleCallback || ((fn: Parameters<typeof setTimeout>[0]) => { setTimeout(fn, 0) });

const store = writable<Notifications>([], () => {
  const interval = setInterval(() => {
    whenIdle(() => {
      const now = Date.now();
      store.update((ns) => {
        return ns.filter((n) => n.expiration < now);
      });
    });
  }, 5000);

  return () => {
    clearInterval(interval);
  };
});

const createNotification = (
  type: NotificationType,
  message: string,
  duration = 30,
): Notification => {
  const now = Date.now();

  return {
    id: String(now + Math.random()),
    type,
    message,
    expiration: now + duration * 1000,
  };
};

const add = (type: NotificationType, message: string, duration = 30): void => {
  store.update((ns) => [...ns, createNotification(type, message, duration)]);
};

const dismiss = (id: string): void => {
  store.update((ns) => ns.filter((n) => n.id !== id));
};

const clear = (): void => {
  store.set([]);
};

export const notifications: Readable<Notifications> & {
  add: typeof add;
  dismiss: typeof dismiss;
  clear: typeof clear;
} = {
  subscribe: store.subscribe,
  add,
  dismiss,
  clear,
};
