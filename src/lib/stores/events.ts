import { derived, Writable, writable } from 'svelte/store';
import get from 'lodash/get';
import set from 'lodash/set';

import type { GetWorkflowExecutionHistoryResponse, HistoryEvent } from '$types';

import { fetchEvents } from '$lib/services/workflow-execution-service';
import {
  createQueryStore,
  QueryStore,
} from '$lib/utilities/create-interval-store';
import { createActivityStore } from './activities';

type EventHistoryStore = QueryStore & {
  events: { [key: string]: HistoryEvent };
};

const stores: { [key: string]: ReturnType<typeof createStore> } = {};

const updateEvents =
  (store: Writable<EventHistoryStore>) =>
  (payload: GetWorkflowExecutionHistoryResponse) => {
    const ids = {};
    const events = {};

    for (const event of payload.history.events) {
      const id = String(event.eventId);
      ids[id] = true;
      events[id] = event;
    }

    store.update(($store) => ({
      ...$store,
      ids: { ...$store.ids, ...ids },
      events: { ...$store.events, ...events },
    }));
  };

export const createStore = (
  namespace: string,
  executionId: string,
  runId: string,
) => {
  const update = () => {
    fetchEvents({
      namespace,
      executionId,
      runId,
      onUpdate: updateEvents(store),
    });
  };

  const store = createQueryStore<EventHistoryStore>('events', update);

  const all = derived(store, ($store) => Object.values($store.events), []);
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
  if (!get(stores, `${namespace}.${executionId}.${runId}`))
    set(
      stores,
      `${namespace}.${executionId}.${runId}`,
      createStore(namespace, executionId, runId),
    );
  return get(stores, `${namespace}.${executionId}.${runId}`);
};
