import { browser } from '$app/env';
import { writable } from 'svelte/store';
import type { Readable } from 'svelte/store';

type NotificationType = 'error' | 'warning' | 'success' | 'information';
type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  expiration: number;
};
type Notifications = Notification[];

const store = writable<Notifications>([], () => {
  const interval = setInterval(() => {
    if (!browser) return;
    requestIdleCallback(() => {
      const now = Date.now();
      store.update((ns) => {
        return ns.filter((n) => n.expiration < now);
      });
    });
  }, 5000);

  return () => {
    if (browser) clearInterval(interval);
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

const add = (type: NotificationType, message: string, duration = 30) => {
  store.update((ns) => [...ns, createNotification(type, message, duration)]);
};

const dismiss = (id: string) => {
  store.update((ns) => ns.filter((n) => n.id !== id));
};

export const notifications: Readable<Notifications> & {
  add: typeof add;
  dismiss: typeof dismiss;
} = {
  subscribe: store.subscribe,
  add,
  dismiss,
};
