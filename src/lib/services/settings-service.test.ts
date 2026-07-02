import { describe, expect, it } from 'vitest';

import type { SettingsResponse } from '$lib/types';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import { fetchSettings, isCloudMatch } from './settings-service';

vi.mock('$lib/utilities/get-api-origin', () => ({
  getApiOrigin: () => 'http://localhost:8080',
}));

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

vi.mock('$lib/utilities/route-for-api', () => ({
  routeForApi: () => '/api/v1/settings',
}));

const settingsResponse = (
  overrides: Partial<SettingsResponse> = {},
): SettingsResponse => ({
  Auth: { Enabled: false, Options: [] },
  Codec: {
    Endpoint: '',
    PassAccessToken: false,
    IncludeCredentials: false,
  },
  DefaultNamespace: 'default',
  DisableWriteActions: false,
  WorkflowTerminateDisabled: false,
  WorkflowCancelDisabled: false,
  WorkflowSignalDisabled: false,
  WorkflowUpdateDisabled: false,
  WorkflowResetDisabled: false,
  WorkflowPauseDisabled: false,
  BatchActionsDisabled: false,
  StartWorkflowDisabled: false,
  HideWorkflowQueryErrors: false,
  RefreshWorkflowCountsDisabled: false,
  ActivityCommandsDisabled: false,
  ShowTemporalSystemNamespace: false,
  FeedbackURL: '',
  DisableNewsFetch: false,
  Version: '2.51.0',
  ...overrides,
});

beforeEach(() => {
  vi.mocked(requestFromAPI).mockReset();
});

describe('isCloudMatch', () => {
  it('should return true for tmprl.cloud', () => {
    expect(isCloudMatch.test('tmprl.cloud')).toBe(true);
  });

  it('should return true for tmprl-test.cloud', () => {
    expect(isCloudMatch.test('tmprl.cloud')).toBe(true);
  });

  it('should return false for non Temporal domains', () => {
    expect(isCloudMatch.test(undefined as unknown as string)).toBe(false);
    expect(isCloudMatch.test('xxx.xxx')).toBe(false);
    expect(isCloudMatch.test('localhost:3000')).toBe(false);
  });
});

describe('fetchSettings', () => {
  it('maps disableNewsFetch from settings response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({ DisableNewsFetch: true }),
    );

    const settings = await fetchSettings();

    expect(settings.disableNewsFetch).toBe(true);
  });
});
