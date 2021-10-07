import { derived, writable } from 'svelte/store';

import get from 'lodash/get';
import set from 'lodash/set';

import { fetchEvents } from '$lib/services/workflow-execution-service';
import { createQueryStore } from '$lib/utilities/create-query-store';
import { createActivityStore } from './activities';
import { HistoryEventWithId, toEventHistory } from '$lib/models/event-history';
import type { GetWorkflowExecutionHistoryResponse } from '$types';

const stores: { [key: string]: ReturnType<typeof createStore> } = {};

export const createStore = (
  namespace: string,
  executionId: string,
  runId: string,
) => {
  const store = createQueryStore<
    HistoryEventWithId,
    GetWorkflowExecutionHistoryResponse,
    typeof fetchEvents
  >(fetchEvents, toEventHistory, {
    namespace,
    executionId,
    runId,
  });

  const all = derived(store, ($store) => Object.values($store.data), []);
  const format = writable<EventFormat>('grid');
  const type = writable<string>(null);

  const filtered = derived(
    [all, type],
    ([$all, eventType]) => {
      return $all.filter((event) => {
        if (eventType && !String(event.eventType).startsWith(eventType))
          return false;
        return true;
      });
    },
    [],
  );

  const activities = createActivityStore(all);

  return {
    subscribe: store.subscribe,
    all,
    filtered,
    activities,
    format,
    type,
  };
};

export const createEventStore = (
  namespace: string,
  executionId: string,
  runId: string,
) => {
  const path = `${namespace}.${executionId}.${runId}`;
  if (!get(stores, path)) {
    console.log('no store found');
    set(stores, path, createStore(namespace, executionId, runId));
  }

  return get(stores, path);
};
