import type { Page } from '@playwright/test';

import { SettingsResponse } from '$src/lib/types';

export const SETTINGS_API = '**/api/v1/settings**';

const defaultSettings = {
  Auth: {
    Enabled: false,
    Options: null,
  },
  BannerText: '',
  DefaultNamespace: '',
  ShowTemporalSystemNamespace: false,
  FeedbackURL: '',
  NotifyOnNewVersion: false,
  Codec: {
    Endpoint: '',
    PassAccessToken: false,
    IncludeCredentials: false,
  },
  Version: '2.15.0',
  DisableWriteActions: false,
  WorkflowTerminateDisabled: false,
  WorkflowCancelDisabled: false,
  WorkflowSignalDisabled: false,
  WorkflowResetDisabled: false,
  BatchActionsDisabled: false,
  HideWorkflowQueryErrors: false,
};

export const mockSettingsApi = async (
  page: Page,
  customSettings: Partial<SettingsResponse> = {},
) => {
  await page.route(SETTINGS_API, async (route) => {
    route.fulfill({ json: { ...defaultSettings, ...customSettings } });
  });
};
