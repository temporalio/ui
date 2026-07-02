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
  CustomUI: {
    Enabled: false,
    IframeExtensions: [],
  },
  ShowTemporalSystemNamespace: false,
  NavCollapsedByDefault: false,
  FeedbackURL: '',
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

  it('maps custom UI iframe extension settings', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue(
      settingsResponse({
        CustomUI: {
          Enabled: true,
          IframeExtensions: [
            {
              ID: 'incident-panel',
              Title: 'Incident Panel',
              Slot: 'workflow.header.after-details',
              Src: '/custom-ui-examples/workflow-header.html',
              AllowedOrigin: 'self',
              RoutePatterns: [
                '/namespaces/:namespace/workflows/:workflow/:run/*',
              ],
              Sandbox: {
                AllowPopups: true,
              },
              Sizing: {
                DefaultHeight: 160,
                MinHeight: 0,
                MaxHeight: 480,
                DefaultWidth: 0,
                MinWidth: 0,
                MaxWidth: 0,
              },
              Permissions: ['context:workflow'],
            },
          ],
        },
      }),
    );

    const settings = await fetchSettings();

    expect(settings.customUi).toEqual({
      enabled: true,
      iframeExtensions: [
        {
          id: 'incident-panel',
          title: 'Incident Panel',
          slot: 'workflow.header.after-details',
          src: '/custom-ui-examples/workflow-header.html',
          allowedOrigin: 'self',
          routePatterns: ['/namespaces/:namespace/workflows/:workflow/:run/*'],
          sandbox: {
            allowDownloads: false,
            allowForms: false,
            allowModals: false,
            allowPopups: true,
            allowPopupsToEscapeSandbox: false,
            allowSameOrigin: false,
          },
          sizing: {
            defaultHeight: 160,
            minHeight: undefined,
            maxHeight: 480,
            defaultWidth: undefined,
            minWidth: undefined,
            maxWidth: undefined,
          },
          permissions: ['context:workflow'],
        },
      ],
    });
  });
});
