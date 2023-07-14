import { writable } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { DataEncoderStatus } from '$lib/types/global';

export const codecEndpoint = persistStore('endpoint', null, true);

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

export function setLastDataEncoderFailure(): void {
  lastDataEncoderStatus.set('error');
}

export function setLastDataEncoderSuccess(): void {
  lastDataEncoderStatus.set('success');
}

export function resetLastDataEncoderSuccess(): void {
  lastDataEncoderStatus.set('notRequested');
}
