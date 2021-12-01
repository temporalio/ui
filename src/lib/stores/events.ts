import { derived, writable } from 'svelte/store';

import type { HistoryEventWithId } from '$lib/models/event-history';
import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { fetchEvents } from '$lib/services/events-service';
import { createQueryStore } from '$lib/utilities/create-query-store';
import { toEventHistory } from '$lib/models/event-history';
import { set } from '$lib/utilities/set-object-key';

import { createActivityStore } from './activities';

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
): ReturnType<typeof createStore> => {
  let store = stores?.[namespace]?.[executionId]?.[runId];
  const path = `${namespace}.${executionId}.${runId}`;

  if (!store) {
    store = createStore(namespace, executionId, runId);
    set(stores, path, store);
  }

  return store;
};
