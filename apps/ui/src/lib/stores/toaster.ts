import { get, type Readable, writable, type Writable } from 'svelte/store';

import type { Toast, ToastPosition } from '$lib/types/holocene';

import { type Announcement, createAnnouncer } from './announcer';

const toasts = writable<Toast[]>([]);
const toastPosition = writable<ToastPosition>('bottom-right');
const announcer = createAnnouncer();

export interface Toaster extends Writable<Toast[]> {
  push: (toast: Toast) => void;
  pop: (id: string) => void;
  clear: () => void;
  toasts: Writable<Toast[]>;
  setPosition: (newPosition: ToastPosition) => void;
  position: Writable<ToastPosition>;
  announcements: Readable<Announcement[]>;
}

const setPosition = (position: ToastPosition): void => {
  toastPosition.set(position);
};

const push = (toast: Toast) => {
  const toastWithDefaults: Toast = {
    id: crypto.randomUUID(),
    duration: 3000,
    variant: 'primary',
    ...toast,
  };
  toasts.update((ts) => [...ts, toastWithDefaults]);
  announcer.announce(
    toastWithDefaults.message,
    toastWithDefaults.variant === 'error' ? 'assertive' : 'polite',
    toastWithDefaults.duration,
  );
  const timeoutId = setTimeout(() => {
    if (toastWithDefaults.id) {
      pop(toastWithDefaults.id);
    }
    if (get(toasts).length === 0) {
      setPosition('bottom-right');
    }
    clearTimeout(timeoutId);
  }, toastWithDefaults.duration);
};

const pop = (id: string) => {
  toasts.update((ts) => ts.filter((t) => t.id !== id));
};

const clear = (): void => {
  toasts.set([]);
  announcer.clear();
};

export const toaster: Toaster = {
  push,
  pop,
  clear,
  toasts,
  set: toasts.set,
  subscribe: toasts.subscribe,
  update: toasts.update,
  setPosition,
  position: toastPosition,
  announcements: announcer.messages,
};
