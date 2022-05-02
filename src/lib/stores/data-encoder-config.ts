import { writable } from 'svelte/store';

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
