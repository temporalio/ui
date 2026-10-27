import { readable, type Readable } from 'svelte/store';

import { getUserPreferenceFactory } from '$lib/utilities/core-provider';

import { persistStore } from './persist-store';

export const USER_PREFERENCE_KEYS = [] as const satisfies readonly string[];

export type UserPreferenceKey = (typeof USER_PREFERENCE_KEYS)[number];

export type UserPreference<T> = Readable<T> & {
  set(value: T): void;
  update(updater: (value: T) => T): void;
  save(value: T): Promise<void>;
  ready: Readable<boolean>;
  error: Readable<unknown | null>;
};

export type UserPreferenceOptions<T> = {
  legacyKey?: string;
  broadcastToAll?: boolean;
  parseLegacy?: (value: string) => T;
  stringifyLegacy?: (value: T) => string;
  onSaveError?: (error: unknown) => void;
};

export type CreateUserPreference = <T>(
  key: UserPreferenceKey,
  defaultValue: T,
  options?: UserPreferenceOptions<T>,
) => UserPreference<T>;

function localUserPreference<T>(
  key: UserPreferenceKey,
  defaultValue: T,
  options: UserPreferenceOptions<T>,
): UserPreference<T> {
  const store = persistStore(
    options.legacyKey ?? key,
    defaultValue,
    options.broadcastToAll,
  );

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    save: async (value) => store.set(value),
    ready: readable(true),
    error: readable(null),
  };
}

export const createUserPreference: CreateUserPreference = (
  key,
  defaultValue,
  options = {},
) => {
  let store: UserPreference<typeof defaultValue> | undefined;
  const selectedStore = () =>
    (store ??=
      getUserPreferenceFactory()?.(key, defaultValue, options) ??
      localUserPreference(key, defaultValue, options));

  return {
    subscribe: (run, invalidate) => selectedStore().subscribe(run, invalidate),
    set: (value) => selectedStore().set(value),
    update: (updater) => selectedStore().update(updater),
    save: (value) => selectedStore().save(value),
    ready: {
      subscribe: (run, invalidate) =>
        selectedStore().ready.subscribe(run, invalidate),
    },
    error: {
      subscribe: (run, invalidate) =>
        selectedStore().error.subscribe(run, invalidate),
    },
  };
};
