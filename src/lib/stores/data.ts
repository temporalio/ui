import { derived, get, Readable, writable } from 'svelte/store';

export type Slice<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | null;
};

export type SliceStore<T> = Readable<Slice<T>>;

export type SliceRequestConfiguration<T, U> = {
  initialData?: U;
  format?: (response: T) => U;
};

const store = writable({});

const update =
  <T>(key: string) =>
  (data: Slice<T>) =>
    store.update((s) => ({ ...s, [key]: { ...data } }));

const newSlice = <T>(initialState?: T): Slice<T> => ({
  isLoading: true,
  isError: false,
  data: initialState || null,
});

function request<T, U>(
  key: string,
  request: () => Promise<T>,
  configuration: SliceRequestConfiguration<T, U> = {},
): SliceStore<U> {
  const { initialData, format = (i) => i } = configuration;
  const currentState: Slice<U> = get(store)[key] || newSlice(initialData);
  const sliceStore = derived(store, (s) => s[key]);
  const updateKey = update(key);

  updateKey({ ...currentState, isLoading: true });

  request().then((data) => {
    updateKey({
      isLoading: false,
      isError: false,
      data: format(data),
    });
  });

  return {
    subscribe: sliceStore.subscribe,
  };
}

export const query = {
  subscribe: store.subscribe,
  request,
};
