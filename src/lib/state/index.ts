import { readable } from 'svelte/store';
import { configureStore } from '@reduxjs/toolkit';

import counter from './features/counter';
import workflowExecutions from './features/workflow-executions';

export const store = configureStore({
  reducer: { counter, workflowExecutions },
});

export type ApplicationState = ReturnType<typeof store.getState>;
export type ApplicationDispatch = typeof store.dispatch;

export const dispatch = store.dispatch;
export const state = readable(store.getState(), (set) =>
  store.subscribe(() => set(store.getState())),
);
