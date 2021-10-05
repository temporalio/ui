import type { Readable, Unsubscriber, Writable } from 'svelte/store';
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

type HasId = { id: string };

type Formatter<ResponseType, FormattedType extends HasId> = (
  response: ResponseType,
) => FormattedType[];

/**
 * Takes an array of items and returns an object with an array
 * of IDs and a hash map where the key is the item's ID and the
 * value is the item itself.
 */
const collectData = <T extends HasId>(
  items: T[],
): Pick<QueryStore<T>, 'ids' | 'data'> => {
  const ids = {};
  const data: { [key: string]: T } = {};

  for (const item of items) {
    const id = item.id;
    ids[id] = true;
    data[id] = item;
  }

  return {
    ids: Object.keys(ids),
    data: data,
  };
};

export const createQueryStore = <
  FormattedType extends HasId,
  ResponseType,
  FetchType extends (options: any) => unknown,
  Options = Parameters<FetchType>[0],
>(
  fetch: FetchType,
  format: Formatter<ResponseType, FormattedType>,
  options: Options,
  dependencies: Readable<Partial<Options>>[] = [],
) => {
  let parameters = options;

  const request = () => {
    fetch({
      ...parameters,
      onUpdate: updateStore(store, format),
      onComplete: removeStaleData(store, format),
    });
  };

  const updateParameters = (updatedParameters: Partial<typeof parameters>) => {
    parameters = { ...parameters, ...updatedParameters };
    request();
  };

  const store = writable<QueryStore<FormattedType>>(
    {
      loading: true,
      updating: false,
      ids: [],
      data: {},
    } as unknown as QueryStore<FormattedType>,
    () => {
      const unsubscribers: Unsubscriber[] = [];
      let idleCallback: number;

      for (const dependency of dependencies) {
        const unsubscribe = dependency.subscribe((value) =>
          updateParameters(value),
        );
        unsubscribers.push(unsubscribe);
      }

      const callback = () => {
        if (browser) {
          if (idleCallback) cancelIdleCallback(idleCallback);
          idleCallback = requestIdleCallback(request);
        }
      };

      /*
       * Dependencies will trigger an update. So, there is no point scheduling
       * an update.
       */
      if (!dependencies.length) setTimeout(callback, 0);

      const interval = setInterval(callback, 30000);

      return () => {
        if (browser && idleCallback) cancelIdleCallback(idleCallback);
        for (const unsubscribe of unsubscribers) unsubscribe();
        clearInterval(interval);
      };
    },
  );

  return {
    ...store,
  };
};

const updateStore =
  <ResponseType, FormattedType extends HasId>(
    store: Writable<QueryStore<FormattedType>>,
    formatter: Formatter<ResponseType, FormattedType>,
  ) =>
  (response: ResponseType) => {
    const formatted = formatter(response);
    const { ids, data } = collectData(formatted);

    return store.update(($store) => ({
      ...$store,
      ids: [...$store.ids, ...Object.keys(ids)],
      data: { ...$store.data, ...data },
    }));
  };

const removeStaleData =
  <ResponseType, FormattedType extends HasId>(
    store: Writable<QueryStore<FormattedType>>,
    formatter: Formatter<ResponseType, FormattedType>,
  ) =>
  (response: ResponseType) => {
    const formatted = formatter(response);
    const { ids, data } = collectData(formatted);

    return store.update(($store) => ({
      ...$store,
      ids: Object.keys(ids),
      data,
    }));
  };
