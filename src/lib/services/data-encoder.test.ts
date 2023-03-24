import { describe, expect, it, vi } from 'vitest';
import { setCodecServerHeaders } from './data-encoder';

const defaultSettings = {
  auth: {
    enabled: false,
    options: [],
  },
  baseUrl: 'http://localhost:8080',
  codec: {
    endpoint: '',
    passAccessToken: false,
  },
  defaultNamespace: 'default',
  disableWriteActions: false,
  workflowTerminateDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowResetDisabled: false,
  batchActionsDisabled: false,
  showTemporalSystemNamespace: false,
  notifyOnNewVersion: false,
  feedbackURL: '',
  runtimeEnvironment: {
    isCloud: false,
    isLocal: false,
    envOverride: false,
  },
  version: '2.12.0',
};
const accessToken = 'abcdefg';

describe('setCodecServerHeaders', () => {
  it('should return default headers if no passAccessToken or CodecServerMiddlewareOptions', () => {
    const { headers, validationFailed } = setCodecServerHeaders(
      'default',
      defaultSettings,
      accessToken,
    );
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Namespace']).toBe('default');
    expect(Object.keys(headers).length).toBe(2);
    expect(validationFailed).toBe(false);
  });

  it('should return headers if passAccessToken and https', () => {
    const settings = {
      ...defaultSettings,
      codec: { endpoint: 'https://localhost:8081', passAccessToken: true },
    };
    const { headers, validationFailed } = setCodecServerHeaders(
      'default',
      settings,
      accessToken,
    );
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Namespace']).toBe('default');
    expect(headers['Authorization']).toBe('Bearer abcdefg');
    expect(Object.keys(headers).length).toBe(3);
    expect(validationFailed).toBe(false);
  });

  it('should fail validation if passAccessToken and http', () => {
    const settings = {
      ...defaultSettings,
      codec: { endpoint: 'http://localhost:8081', passAccessToken: true },
    };
    const { headers, validationFailed } = setCodecServerHeaders(
      'default',
      settings,
      accessToken,
    );
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Namespace']).toBe('default');
    expect(Object.keys(headers).length).toBe(2);
    expect(validationFailed).toBe(true);
  });

  it('should set a single option from CodecServerHeaderOptions', () => {
    vi.stubGlobal('CodecServerHeaderOptions', { credentials: 'include' });
    const { headers, validationFailed } = setCodecServerHeaders(
      'default',
      defaultSettings,
      accessToken,
    );
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Namespace']).toBe('default');
    expect(headers['credentials']).toBe('include');
    expect(Object.keys(headers).length).toBe(3);
    expect(validationFailed).toBe(false);
    vi.unstubAllGlobals();
  });

  it('should set a multiple options from CodecServerHeaderOptions', () => {
    vi.stubGlobal('CodecServerHeaderOptions', {
      credentials: 'include',
      'X-Some-Header': 'test123',
    });
    const { headers, validationFailed } = setCodecServerHeaders(
      'default',
      defaultSettings,
      accessToken,
    );
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Namespace']).toBe('default');
    expect(headers['credentials']).toBe('include');
    expect(headers['X-Some-Header']).toBe('test123');
    expect(Object.keys(headers).length).toBe(4);
    expect(validationFailed).toBe(false);
    vi.unstubAllGlobals();
  });

  it('should set a multiple options from CodecServerHeaderOptions and access token', () => {
    const settings = {
      ...defaultSettings,
      codec: { endpoint: 'https://localhost:8081', passAccessToken: true },
    };
    vi.stubGlobal('CodecServerHeaderOptions', {
      credentials: 'include',
      'X-Some-Header': 'test123',
    });
    const { headers, validationFailed } = setCodecServerHeaders(
      'default',
      settings,
      accessToken,
    );
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Namespace']).toBe('default');
    expect(headers['Authorization']).toBe('Bearer abcdefg');
    expect(headers['credentials']).toBe('include');
    expect(headers['X-Some-Header']).toBe('test123');
    expect(Object.keys(headers).length).toBe(5);
    expect(validationFailed).toBe(false);
    vi.unstubAllGlobals();
  });
});
