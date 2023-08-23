import { beforeEach, describe, expect, it } from 'vitest';

import {
  codecEndpoint,
  includeCredentials,
  overrideRemoteCodecConfiguration,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type { Settings } from '$lib/types/global';

import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from './get-codec';

const defaultSettings = {
  auth: {
    enabled: false,
    options: null,
  },
  defaultNamespace: '',
  showTemporalSystemNamespace: false,
  feedbackURL: '',
  notifyOnNewVersion: false,
  codec: {
    endpoint: '',
    passAccessToken: false,
    includeCredentials: false,
    decodeEventHistoryDownload: false,
  },
  version: '2.15.0',
  disableWriteActions: false,
  workflowTerminateDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowResetDisabled: false,
  batchActionsDisabled: false,
};

const getSettings = (customSettings: Partial<Settings> = {}): Settings => {
  return { ...defaultSettings, ...customSettings };
};

const clearLocalStorageAndStores = () => {
  localStorage.clear();
  passAccessToken.set(false);
  codecEndpoint.set(null);
  includeCredentials.set(false);
  overrideRemoteCodecConfiguration.set(false);
};

describe('getCodec with only configuration settings', () => {
  beforeEach(() => {
    clearLocalStorageAndStores();
  });

  it('should return codec endpoint from settings', () => {
    const settings = getSettings({
      codec: { endpoint: 'https://mycodecserver.dev' },
    });
    const endpoint = getCodecEndpoint(settings);
    const passAccessToken = getCodecPassAccessToken(settings);
    const includeCredentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(passAccessToken).toEqual(false);
    expect(includeCredentials).toEqual(false);
  });

  it('should return codec endpoint and access token from settings', () => {
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: true,
        includeCredentials: false,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const passAccessToken = getCodecPassAccessToken(settings);
    const includeCredentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(passAccessToken).toEqual(true);
    expect(includeCredentials).toEqual(false);
  });

  it('should return codec endpoint and include credentials from settings', () => {
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: false,
        includeCredentials: true,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const passAccessToken = getCodecPassAccessToken(settings);
    const includeCredentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(passAccessToken).toEqual(false);
    expect(includeCredentials).toEqual(true);
  });
});

describe('getCodec with configuration settings and local settings but override off', () => {
  beforeEach(() => {
    clearLocalStorageAndStores();
  });

  it('should return codec endpoint from settings with local setting endpoint set', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: false,
        includeCredentials: false,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const passAccessToken = getCodecPassAccessToken(settings);
    const includeCredentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(passAccessToken).toEqual(false);
    expect(includeCredentials).toEqual(false);
  });

  it('should return codec endpoint from settings and with local setting endpoint and both options set', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    passAccessToken.set(true);
    includeCredentials.set(true);
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: false,
        includeCredentials: false,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);
    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(token).toEqual(false);
    expect(credentials).toEqual(false);
  });

  it('should return codec endpoint from settings and with local settings with one option set', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    passAccessToken.set(true);
    includeCredentials.set(false);
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: false,
        includeCredentials: true,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);
    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(token).toEqual(false);
    expect(credentials).toEqual(true);
  });

  it('should return codec endpoint from local setting with no settings', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    passAccessToken.set(true);
    includeCredentials.set(false);
    const settings = getSettings();
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);
    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('http://mylocalserver.dev');
    expect(token).toEqual(true);
    expect(credentials).toEqual(false);
  });
});

describe('getCodec with configuration settings and local settings but override on', () => {
  beforeEach(() => {
    clearLocalStorageAndStores();
  });

  it('should return codec endpoint from local setting', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    overrideRemoteCodecConfiguration.set(true);
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: false,
        includeCredentials: false,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);

    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('http://mylocalserver.dev');
    expect(token).toEqual(false);
    expect(credentials).toEqual(false);
  });

  it('should return codec endpoint from local setting with options', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    passAccessToken.set(false);
    includeCredentials.set(true);
    overrideRemoteCodecConfiguration.set(true);

    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: true,
        includeCredentials: true,
      },
    });
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);

    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('http://mylocalserver.dev');
    expect(token).toEqual(false);
    expect(credentials).toEqual(true);
  });
});

describe('getCodec with configuration settings and local settings after multiple updates', () => {
  beforeEach(() => {
    clearLocalStorageAndStores();
  });

  it('Get settings without local settings, then add local settings with override, then remove override', () => {
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
        passAccessToken: true,
        includeCredentials: false,
      },
    });

    expect(getCodecEndpoint(settings)).toEqual('https://mycodecserver.dev');
    expect(getCodecPassAccessToken(settings)).toEqual(true);
    expect(getCodecIncludeCredentials(settings)).toEqual(false);

    codecEndpoint.set('http://mylocalserver.dev');
    passAccessToken.set(false);
    includeCredentials.set(false);
    overrideRemoteCodecConfiguration.set(true);

    expect(getCodecEndpoint(settings)).toEqual('http://mylocalserver.dev');
    expect(getCodecPassAccessToken(settings)).toEqual(false);
    expect(getCodecIncludeCredentials(settings)).toEqual(false);

    overrideRemoteCodecConfiguration.set(false);

    expect(getCodecEndpoint(settings)).toEqual('https://mycodecserver.dev');
    expect(getCodecPassAccessToken(settings)).toEqual(true);
    expect(getCodecIncludeCredentials(settings)).toEqual(false);
  });
});
