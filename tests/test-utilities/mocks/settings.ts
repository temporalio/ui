import type { Page } from '@playwright/test';

export const SETTINGS_API = 'http://localhost:8233/api/v1/settings**';

const MOCK_SETTINGS = {
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

export const mockSettingsApi = (page: Page) => {
  return page.route(SETTINGS_API, (route) => {
    route.fulfill({ json: MOCK_SETTINGS });
  });
};
