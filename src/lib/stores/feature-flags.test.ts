import { get } from 'svelte/store';

import { afterEach, describe, expect, it } from 'vitest';

import { getFlagStore, setFeatureFlag } from './feature-flags';

describe('setFeatureFlag', () => {
  afterEach(() => {
    getFlagStore('serverlessDeployments').set(false);
  });

  it('should enable a flag', () => {
    setFeatureFlag('serverlessDeployments', true);
    expect(get(getFlagStore('serverlessDeployments'))).toBe(true);
  });

  it('should disable a flag', () => {
    setFeatureFlag('serverlessDeployments', true);
    setFeatureFlag('serverlessDeployments', false);
    expect(get(getFlagStore('serverlessDeployments'))).toBe(false);
  });

  it('should use a per-flag localStorage key', () => {
    setFeatureFlag('serverlessDeployments', true);
    setFeatureFlag('otherFlag', true);
    expect(get(getFlagStore('serverlessDeployments'))).toBe(true);
    expect(get(getFlagStore('otherFlag'))).toBe(true);
    setFeatureFlag('serverlessDeployments', false);
    expect(get(getFlagStore('serverlessDeployments'))).toBe(false);
    expect(get(getFlagStore('otherFlag'))).toBe(true);
    getFlagStore('otherFlag').set(false);
  });
});
