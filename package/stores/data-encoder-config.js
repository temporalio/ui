import { writable } from 'svelte/store';
import { persistStore } from './persist-store';
export const dataEncoderEndpoint = persistStore('endpoint', null);
export const lastDataEncoderStatus = writable('notRequested');
export function setLastDataEncoderFailure() {
    lastDataEncoderStatus.set('error');
}
export function setLastDataEncoderSuccess() {
    lastDataEncoderStatus.set('success');
}
export function resetLastDataEncoderSuccess() {
    lastDataEncoderStatus.set('notRequested');
}
