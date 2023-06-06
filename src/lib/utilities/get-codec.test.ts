import { describe, expect, it, beforeEach } from 'vitest';
import {
  getCodecEndpoint,
  getCodecPassAccessToken,
  getCodecIncludeCredentials,
} from './get-codec';
import type { Settings } from '$lib/types/global';
import {
  codecEndpoint,
  passAccessToken,
  includeCredentials,
  overrideRemoteCodecConfiguration,
} from '$lib/stores/data-encoder-config';

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

describe('getCodec', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return codec endpoint from settings if no override', () => {
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

  it('should return codec endpoint and access token from settings if no override', () => {
    const settings = getSettings({
      codec: { endpoint: 'https://mycodecserver.dev', passAccessToken: true },
    });
    const endpoint = getCodecEndpoint(settings);
    const passAccessToken = getCodecPassAccessToken(settings);
    const includeCredentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(passAccessToken).toEqual(true);
    expect(includeCredentials).toEqual(false);
  });

  it('should return codec endpoint and include credentials from settings if no override', () => {
    const settings = getSettings({
      codec: {
        endpoint: 'https://mycodecserver.dev',
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

  it('should return codec endpoint from settings and with local setting but if no override', () => {
    codecEndpoint.set('http://mylocalserver.dev');
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

  it('should return codec endpoint from settings and with local setting but if no override', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    passAccessToken.set(true);
    includeCredentials.set(true);
    const settings = getSettings({
      codec: { endpoint: 'https://mycodecserver.dev' },
    });
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);
    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('https://mycodecserver.dev');
    expect(token).toEqual(true);
    expect(credentials).toEqual(true);
  });

  it('should return codec endpoint from local setting with override', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    overrideRemoteCodecConfiguration.set(true);
    passAccessToken.set(true);
    includeCredentials.set(true);
    const settings = getSettings({
      codec: { endpoint: 'https://mycodecserver.dev' },
    });
    const endpoint = getCodecEndpoint(settings);
    const token = getCodecPassAccessToken(settings);
    const credentials = getCodecIncludeCredentials(settings);
    expect(endpoint).toEqual('http://mylocalserver.dev');
    expect(token).toEqual(true);
    expect(credentials).toEqual(true);
  });

  it('should return codec endpoint from local setting without override and no settings', () => {
    codecEndpoint.set('http://mylocalserver.dev');
    overrideRemoteCodecConfiguration.set(false);
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

  it('should return codec endpoint from settings without override and with settings', () => {
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
});
