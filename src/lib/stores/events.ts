import { derived, Writable, writable } from 'svelte/store';
import type { GetWorkflowExecutionHistoryResponse } from '$types';
import { fetchEvents } from '$lib/services/workflow-execution-service';

type EventHistoryStore = {
  loading: boolean;
  updating: boolean;
  ids: { [key: string]: boolean };
  events: { [key: string]: BaseEvent };
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
  const store = writable<EventHistoryStore>(
    {
      loading: true,
      updating: false,
      ids: {},
      events: {},
    },
    () => {
      fetchEvents({
        namespace,
        executionId,
        runId,
        onUpdate: updateEvents(store),
      });

      const interval = setInterval(() => {
        fetchEvents({
          namespace,
          executionId,
          runId,
          onUpdate: updateEvents(store),
        });
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    },
  );

  return {
    all: derived(store, ($store) => Object.values($store.events)),
  };
};

export const createEventStore = (
  namespace: string,
  executionId: string,
  runId: string,
) => {
  if (!stores[namespace])
    stores[namespace] = createStore(namespace, executionId, runId);
  return stores[namespace];
};
