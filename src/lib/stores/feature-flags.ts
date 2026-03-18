import { persistStore } from './persist-store';

const _stores = new Map<string, ReturnType<typeof persistStore<boolean>>>();

export function getFlagStore(key: string) {
  if (!_stores.has(key)) {
    _stores.set(key, persistStore<boolean>(`featureFlags.${key}`, false, true));
  }
  return _stores.get(key)!;
}

export function setFeatureFlag(key: string, enabled: boolean): void {
  getFlagStore(key).set(enabled);
}
