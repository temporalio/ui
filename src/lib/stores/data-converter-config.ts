import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const dataConverterPort = persistStore('port', null);

type DataConverterStatus = 'notRequested' | 'success' | 'error';
export const lastDataConverterStatus =
  writable<DataConverterStatus>('notRequested');

export function setLastDataConverterFailure(): void {
  lastDataConverterStatus.set('error');
}

export function setLastDataConverterSuccess(): void {
  lastDataConverterStatus.set('success');
}
