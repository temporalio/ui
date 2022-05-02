import { writable, derived } from 'svelte/store';
import { page } from '$app/stores';

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

export const dataEncoder = derived([page], ([$page]) => {
  return {
    namespace: $page.params.namespace,
    endpoint: $page.stuff.settings.codec?.endpoint,
    accessToken: $page.stuff.settings.codec?.accessToken,
  };
});
