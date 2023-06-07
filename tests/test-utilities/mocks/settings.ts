import type { Page } from '@playwright/test';
import { SettingsResponse } from '$src/lib/types';

export const SETTINGS_API = 'http://localhost:8233/api/v1/settings**';
const defaultSettings = {
  Auth: {
    Enabled: false,
    Options: null,
  },
  DefaultNamespace: '',
  ShowTemporalSystemNamespace: false,
  FeedbackURL: '',
  NotifyOnNewVersion: false,
  Codec: {
    Endpoint: '',
    PassAccessToken: false,
    IncludeCredentials: false,
    DecodeEventHistoryDownload: false,
  },
  Version: '2.15.0',
  DisableWriteActions: false,
  WorkflowTerminateDisabled: false,
  WorkflowCancelDisabled: false,
  WorkflowSignalDisabled: false,
  WorkflowResetDisabled: false,
  BatchActionsDisabled: false,
};

export const mockSettingsApi = async (
  page: Page,
  customSettings: Partial<SettingsResponse> = {},
) => {
  await page.route(SETTINGS_API, async (route) => {
    route.fulfill({ json: { ...defaultSettings, ...customSettings } });
  });
};
