import type { Page } from '@playwright/test';

import { GetSystemInfoResponse } from '$src/lib/types';

export const SYSTEM_INFO_API = '**/api/v1/system-info**';

const defaultSystemInfo = {
  serverVersion: '1.22.0',
  capabilities: {
    signalAndQueryHeader: true,
    internalErrorDifferentiation: true,
    activityFailureIncludeHeartbeat: true,
    supportsSchedules: true,
    encodedFailureAttributes: true,
    buildIdBasedVersioning: true,
    upsertMemo: true,
    eagerWorkflowStart: true,
    sdkMetadata: true,
    countGroupByExecutionStatus: true,
  },
};
export const mockSystemInfoApi = async (
  page: Page,
  systemInfo: Partial<GetSystemInfoResponse> = {},
) => {
  await page.route(SYSTEM_INFO_API, async (route) => {
    route.fulfill({ json: { ...defaultSystemInfo, ...systemInfo } });
  });
};
