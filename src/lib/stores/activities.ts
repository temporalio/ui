import { writable } from 'svelte/store';

export const activityRefresh = writable(0);
export const activityLoading = writable(true);
export const activityUpdating = writable(true);

export const activityCount = writable({
  count: 0,
  newCount: 0,
});
export const activityWorkerCount = writable<number | undefined>(undefined);

export const activityError = writable('');
export const activitiesQuery = writable<string>('');
export const activitiesSearchParams = writable<string>('');
