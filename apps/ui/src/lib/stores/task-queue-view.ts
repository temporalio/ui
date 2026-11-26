import { persistStore } from '$lib/stores/persist-store';
import type { TaskQueueView } from '$lib/types/events';

export const taskQueueView = persistStore<TaskQueueView>(
  'taskQueueView',
  'workers',
  true,
);
