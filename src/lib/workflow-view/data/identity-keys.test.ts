import { describe, expect, it } from 'vitest';

import { getLifecycleFilterKey } from './identity-keys';

describe('getLifecycleFilterKey', () => {
  it('returns a stable, prefixed key for a filter name', () => {
    expect(getLifecycleFilterKey('category.activity')).toBe(
      'lifecycle-filter:({"name":"category.activity"})',
    );
    expect(getLifecycleFilterKey('category.activity')).toBe(
      getLifecycleFilterKey('category.activity'),
    );
  });

  it('distinguishes different filter names', () => {
    expect(getLifecycleFilterKey('category.activity')).not.toBe(
      getLifecycleFilterKey('category.timer'),
    );
  });

  it('serializes special characters without ambiguous keys', () => {
    expect(getLifecycleFilterKey('status."failed"\\pending')).toBe(
      `lifecycle-filter:(${JSON.stringify({ name: 'status."failed"\\pending' })})`,
    );
    expect(getLifecycleFilterKey('status."failed"\\pending')).not.toBe(
      getLifecycleFilterKey('status."failed"pending'),
    );
  });
});
