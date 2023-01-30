import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const codecEndpoint = persistStore('endpoint', null, true);

export const passAccessToken = persistStore<boolean>(
  'passAccessToken',
  false,
  true,
);

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
