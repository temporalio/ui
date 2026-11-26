import { get } from 'svelte/store';

import { beforeEach, describe, expect, it } from 'vitest';

import { dataEncoder } from './data-encoder';
import {
  codecEndpoint,
  overrideRemoteCodecConfiguration,
} from './data-encoder-config';

const clearLocalStorageAndStores = () => {
  localStorage.clear();
  codecEndpoint.set('');
  overrideRemoteCodecConfiguration.set(false);
};

describe('dataEncoder', () => {
  beforeEach(clearLocalStorageAndStores);

  it('should set default values', () => {
    expect(get(dataEncoder)).toEqual({
      endpoint: '',
      hasError: false,
      hasNotRequested: true,
      hasSuccess: false,
      namespace: 'default',
      settingsEndpoint: '',
      settingsIncludeCredentials: false,
      settingsPassAccessToken: false,
      customErrorLink: '',
      customErrorMessage: '',
    });
  });

  it('should set codecEndpoint when the override is on', () => {
    codecEndpoint.set('https://localhost:8383');
    overrideRemoteCodecConfiguration.set(true);
    expect(get(dataEncoder)).toEqual({
      endpoint: 'https://localhost:8383',
      hasError: false,
      hasNotRequested: true,
      hasSuccess: false,
      namespace: 'default',
      settingsEndpoint: '',
      settingsIncludeCredentials: false,
      settingsPassAccessToken: false,
      customErrorLink: '',
      customErrorMessage: '',
    });
  });

  it('should ignore a saved codecEndpoint when the override is off', () => {
    codecEndpoint.set('https://localhost:8383');
    expect(get(dataEncoder).endpoint).toBe('');
  });
});
