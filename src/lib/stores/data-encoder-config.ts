import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const dataEncoderEndpoint = persistStore('endpoint', null, true);

export const lastDataEncoderStatus =
  writable<DataEncoderStatus>('notRequested');

export function setLastDataEncoderFailure(): void {
  lastDataEncoderStatus.set('error');
}

export function setLastDataEncoderSuccess(): void {
  lastDataEncoderStatus.set('success');
}

export function resetLastDataEncoderSuccess(): void {
  lastDataEncoderStatus.set('notRequested');
}
