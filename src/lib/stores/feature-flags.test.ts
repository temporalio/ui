import { get } from 'svelte/store';

import { afterEach, describe, expect, it } from 'vitest';

import { getFlagStore, setFeatureFlag } from './feature-flags';

describe('setFeatureFlag', () => {
  afterEach(() => {
    getFlagStore('serverlessWorkers').set(false);
  });

  it('should enable a flag', () => {
    setFeatureFlag('serverlessWorkers', true);
    expect(get(getFlagStore('serverlessWorkers'))).toBe(true);
  });

  it('should disable a flag', () => {
    setFeatureFlag('serverlessWorkers', true);
    setFeatureFlag('serverlessWorkers', false);
    expect(get(getFlagStore('serverlessWorkers'))).toBe(false);
  });

  it('should use a per-flag localStorage key', () => {
    setFeatureFlag('serverlessWorkers', true);
    setFeatureFlag('otherFlag', true);
    expect(get(getFlagStore('serverlessWorkers'))).toBe(true);
    expect(get(getFlagStore('otherFlag'))).toBe(true);
    setFeatureFlag('serverlessWorkers', false);
    expect(get(getFlagStore('serverlessWorkers'))).toBe(false);
    expect(get(getFlagStore('otherFlag'))).toBe(true);
    getFlagStore('otherFlag').set(false);
  });
});
