import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const dataConverterPort = persistStore('port', null);
export const dataConverterEndpoint = persistStore('endpoint', null);

type DataConverterStatus = 'notRequested' | 'success' | 'error';
export const lastDataConverterStatus =
  writable<DataConverterStatus>('notRequested');

export function setLastDataConverterFailure(): void {
  lastDataConverterStatus.set('error');
}

export function setLastDataConverterSuccess(): void {
  lastDataConverterStatus.set('success');
}

export function resetLastDataConverterSuccess(): void {
  lastDataConverterStatus.set('notRequested');
}
