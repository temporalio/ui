import { derived, Writable } from 'svelte/store';
import { browser } from '$app/env';
import { writable } from 'svelte/store';

export type QueryStore<T> = {
  loading: boolean;
  updating: boolean;
  ids: string[];
  data: {
    [key: string]: T;
  };
};

type Formatter<ResponseType, FormattedType extends { id: string }> = (
  response: ResponseType,
) => FormattedType[];

export const createQueryStore = <FormattedType extends { id: string }>(
  update: () => void,
) => {
  const store = writable<QueryStore<FormattedType>>(
    {
      loading: true,
      updating: false,
      ids: [],
      data: {},
    } as unknown as QueryStore<FormattedType>,
    () => {
      let idleCallback: number;

      const callback = () => {
        if (browser) {
          if (idleCallback) cancelIdleCallback(idleCallback);
          idleCallback = requestIdleCallback(update);
        }
      };

      setTimeout(callback, 0);
      const interval = setInterval(callback, 30000);

      return () => {
        if (browser && idleCallback) cancelIdleCallback(idleCallback);
        clearInterval(interval);
      };
    },
  );

  return {
    subscribe: store.subscribe,
    updateStore: <ResponseType>(
      formatter: Formatter<ResponseType, FormattedType>,
    ) => updateStore(store, formatter),
    isEmpty: derived(
      store,
      ($store) => $store.loading === false && $store.ids.length === 0,
    ),
  };
};

export const updateStore =
  <ResponseType, FormattedType extends { id: string }>(
    store: Writable<QueryStore<FormattedType>>,
    formatter: Formatter<ResponseType, FormattedType>,
  ) =>
  (response: ResponseType) => {
    const formatted = formatter(response);
    const ids = {};
    const result: { [key: string]: FormattedType } = {};

    for (const datum of formatted) {
      const id = datum.id;
      ids[id] = true;
      result[id] = datum;
    }

    return store.update(($store) => ({
      ...$store,
      ids: [...$store.ids, ...Object.keys(ids)],
      data: { ...$store.data, ...result },
    }));
  };

export const setLoading =
  <S>(store: Writable<S>) =>
  (value: boolean) =>
  () => {
    store.update(($store) => ({ ...$store, loading: value }));
  };
