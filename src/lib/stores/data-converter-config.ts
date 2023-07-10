import { writable } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { DataEncoderStatus } from '$lib/types/global';

export const dataConverterPort = persistStore('port', null, true);

export const lastDataConverterStatus =
  writable<DataEncoderStatus>('notRequested');

export function setLastDataConverterFailure(error?: string): void {
  lastDataConverterStatus.set('error');
  if (error) console.error(error);
}

export function setLastDataConverterSuccess(): void {
  lastDataConverterStatus.set('success');
}

export function resetLastDataConverterSuccess(): void {
  lastDataConverterStatus.set('notRequested');
}
