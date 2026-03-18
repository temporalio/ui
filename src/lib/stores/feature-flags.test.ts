import { get } from 'svelte/store';

import { afterEach, describe, expect, it } from 'vitest';

import {
  featureFlags,
  isFeatureFlagEnabled,
  setFeatureFlag,
} from './feature-flags';

describe('featureFlags', () => {
  afterEach(() => {
    featureFlags.set({});
  });

  it('should start with an empty map', () => {
    expect(get(featureFlags)).toEqual({});
  });

  it('should set and read a feature flag', () => {
    setFeatureFlag('serverless-workers', true);
    expect(get(featureFlags)['serverless-workers']).toBe(true);
  });

  it('should disable a feature flag', () => {
    setFeatureFlag('serverless-workers', true);
    setFeatureFlag('serverless-workers', false);
    expect(get(featureFlags)['serverless-workers']).toBe(false);
  });

  it('should preserve other flags when setting one', () => {
    // Seed the store with an extra key to simulate a second flag or
    // an arbitrary key that may exist in localStorage.
    featureFlags.set({ 'serverless-workers': true, 'other-flag': true });
    setFeatureFlag('serverless-workers', false);
    const flags = get(featureFlags);
    expect(flags['serverless-workers']).toBe(false);
    expect(flags['other-flag']).toBe(true);
  });
});

describe('isFeatureFlagEnabled', () => {
  afterEach(() => {
    featureFlags.set({});
  });

  it('should return false for unset flags', () => {
    const enabled = isFeatureFlagEnabled('serverless-workers');
    expect(get(enabled)).toBe(false);
  });

  it('should return true for enabled flags', () => {
    setFeatureFlag('serverless-workers', true);
    const enabled = isFeatureFlagEnabled('serverless-workers');
    expect(get(enabled)).toBe(true);
  });

  it('should return false for explicitly disabled flags', () => {
    setFeatureFlag('serverless-workers', false);
    const enabled = isFeatureFlagEnabled('serverless-workers');
    expect(get(enabled)).toBe(false);
  });

  it('should react to flag changes', () => {
    const enabled = isFeatureFlagEnabled('serverless-workers');
    expect(get(enabled)).toBe(false);

    setFeatureFlag('serverless-workers', true);
    expect(get(enabled)).toBe(true);

    setFeatureFlag('serverless-workers', false);
    expect(get(enabled)).toBe(false);
  });
});
