import { writable } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { DataEncoderStatus } from '$lib/types/global';
import { has } from '$lib/utilities/has';

export const codecEndpoint = persistStore<string>('endpoint', null, true);

export const passAccessToken = persistStore<boolean>(
  'passAccessToken',
  false,
  true,
);

export const includeCredentials = persistStore<boolean>(
  'includeCredentials',
  false,
  true,
);

export const overrideRemoteCodecConfiguration = persistStore<boolean>(
  'overrideRemoteCodecConfiguration',
  false,
  true,
);

export const lastDataEncoderStatus =
  writable<DataEncoderStatus>('notRequested');

export const lastDataEncoderError = writable<string>('');

export function setLastDataEncoderFailure(error?: unknown): void {
  lastDataEncoderStatus.set('error');

  if (error && has(error, 'message') && typeof error.message === 'string') {
    lastDataEncoderError.set(error.message);
  } else {
    lastDataEncoderError.set('');
  }
}

export function setLastDataEncoderSuccess(): void {
  lastDataEncoderStatus.set('success');
}

export function resetLastDataEncoderSuccess(): void {
  lastDataEncoderStatus.set('notRequested');
}
