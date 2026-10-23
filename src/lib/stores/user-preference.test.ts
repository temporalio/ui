import { get, readable, writable } from 'svelte/store';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { initCoreProvider } from '$lib/utilities/core-provider';

import {
  createUserPreference,
  type CreateUserPreference,
  type UserPreference,
} from './user-preference';

const baseProvider = { getAccessToken: async () => '' };

describe('createUserPreference', () => {
  beforeEach(() => {
    localStorage.clear();
    initCoreProvider(baseProvider);
  });

  test('uses the existing localStorage store when no preference provider is set', async () => {
    const preference = createUserPreference('theme', false);

    expect(get(preference.ready)).toBe(true);
    preference.set(true);
    expect(localStorage.getItem('theme')).toBe('true');
    await preference.save(false);
    expect(localStorage.getItem('theme')).toBe('false');

    const later = createUserPreference('theme', true);
    expect(get(later)).toBe(false);
  });

  test('selects a provider on first use, even when the store was created earlier', async () => {
    const preference = createUserPreference('theme', false);
    const create = vi.fn(
      <T>(_key: string, initialValue: T): UserPreference<T> => {
        const store = writable(initialValue);
        return {
          subscribe: store.subscribe,
          set: store.set,
          update: store.update,
          save: async (value) => store.set(value),
          ready: readable(true),
          error: readable(null),
        };
      },
    ) satisfies CreateUserPreference;
    initCoreProvider({ ...baseProvider, createUserPreference: create });

    expect(get(preference)).toBe(false);
    preference.set(true);
    await preference.save(false);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith('theme', false, {});
    expect(localStorage.getItem('theme')).toBeNull();
  });
});
