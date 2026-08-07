import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  WorkflowSortingEnabled: false,
  ShowTemporalSystemNamespace: false,
  NavCollapsedByDefault: false,
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
  it('maps navCollapsedByDefault from settings response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({ NavCollapsedByDefault: true }),
    );

    const settings = await fetchSettings();

    expect(settings.navCollapsedByDefault).toBe(true);
  });

  it('defaults navCollapsedByDefault to false when omitted', async () => {
    const response = settingsResponse();
    delete (response as Partial<SettingsResponse>).NavCollapsedByDefault;
    vi.mocked(requestFromAPI).mockResolvedValue(response);

    const settings = await fetchSettings();

    expect(settings.navCollapsedByDefault).toBe(false);
  });

  it('maps workflowSortingEnabled from settings response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({ WorkflowSortingEnabled: true }),
    );

    const settings = await fetchSettings();

    expect(settings.workflowSortingEnabled).toBe(true);
  });

  it('defaults workflowSortingEnabled to false when omitted', async () => {
    const response = settingsResponse();
    delete (response as Partial<SettingsResponse>).WorkflowSortingEnabled;
    vi.mocked(requestFromAPI).mockResolvedValue(response);

    const settings = await fetchSettings();

    expect(settings.workflowSortingEnabled).toBe(false);
  });

  it('maps disableNewsFetch from settings response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({ DisableNewsFetch: true }),
    );

    const settings = await fetchSettings();

    expect(settings.disableNewsFetch).toBe(true);
  });

  it('should map redirectToProvider auth settings', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({
        Auth: {
          Enabled: true,
          Options: ['audience'],
          RedirectToProvider: true,
        },
      }),
    );

    const settings = await fetchSettings();

    expect(settings.auth).toEqual({
      enabled: true,
      options: ['audience'],
      redirectToProvider: true,
    });
  });

  it('should default redirectToProvider to false', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({
        Auth: {
          Enabled: true,
          Options: null,
        },
      }),
    );

    const settings = await fetchSettings();

    expect(settings.auth.redirectToProvider).toBe(false);
  });
});
