import { writable } from 'svelte/store';

import type { DataEncoderStatus } from '$lib/types/global';

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
