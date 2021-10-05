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
    fetch({ ...parameters, onUpdate: updateStore(store, format) });
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

      setTimeout(callback, 0);
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

export const updateStore =
  <ResponseType, FormattedType extends HasId>(
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
