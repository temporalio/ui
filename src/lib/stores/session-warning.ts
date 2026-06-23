import { writable } from 'svelte/store';

export type SessionWarningState = 'idle' | 'warning' | 'expired';

export const sessionWarningState = writable<SessionWarningState>('idle');

export const triggerSessionExpired = () => {
  sessionWarningState.set('expired');
};

export const dismissSessionWarning = () => {
  sessionWarningState.set('idle');
};
