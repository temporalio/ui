import { BROWSER } from 'esm-env';

import type { SettingsResponse } from '$lib/types';
import type { Settings } from '$lib/types/global';
import { getApiOrigin } from '$lib/utilities/get-api-origin';
import { getEnvironment } from '$lib/utilities/get-environment';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const isCloudMatch = /(tmprl\.cloud|tmprl-test\.cloud)$/;

export const fetchSettings = async (request = fetch): Promise<Settings> => {
  const route = routeForApi('settings');
  const settingsResponse: SettingsResponse = await requestFromAPI(route, {
    request,
  });

  const EnvironmentOverride = getEnvironment();

  const settingsInformation = {
    auth: {
      enabled: !!settingsResponse?.Auth?.Enabled,
      options: settingsResponse?.Auth?.Options,
    },
    bannerText: settingsResponse?.BannerText,
    baseUrl: getApiOrigin(),
    codec: {
      endpoint: settingsResponse?.Codec?.Endpoint,
      passAccessToken: settingsResponse?.Codec?.PassAccessToken,
      includeCredentials: settingsResponse?.Codec?.IncludeCredentials,
      customErrorMessage: {
        default: {
          message: settingsResponse?.Codec?.DefaultErrorMessage || '',
          link: settingsResponse?.Codec?.DefaultErrorLink || '',
        },
      },
    },
    defaultNamespace: settingsResponse?.DefaultNamespace || 'default', // API returns an empty string if default namespace is not configured
    disableWriteActions: !!settingsResponse?.DisableWriteActions || false,
    workflowTerminateDisabled: !!settingsResponse?.WorkflowTerminateDisabled,
    workflowCancelDisabled: !!settingsResponse?.WorkflowCancelDisabled,
    workflowSignalDisabled: !!settingsResponse?.WorkflowSignalDisabled,
    workflowUpdateDisabled: !!settingsResponse?.WorkflowUpdateDisabled,
    workflowResetDisabled: !!settingsResponse?.WorkflowResetDisabled,
    batchActionsDisabled: !!settingsResponse?.BatchActionsDisabled,
    startWorkflowDisabled: !!settingsResponse?.StartWorkflowDisabled,
    hideWorkflowQueryErrors: !!settingsResponse?.HideWorkflowQueryErrors,
    refreshWorkflowCountsDisabled:
      !!settingsResponse?.RefreshWorkflowCountsDisabled,
    activityCommandsDisabled: !!settingsResponse?.ActivityCommandsDisabled,

    showTemporalSystemNamespace: settingsResponse?.ShowTemporalSystemNamespace,
    notifyOnNewVersion: settingsResponse?.NotifyOnNewVersion,
    feedbackURL: settingsResponse?.FeedbackURL,
    runtimeEnvironment: {
      get isCloud() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'cloud';
        }

        return isCloudMatch.test(BROWSER ? window.location.hostname : '');
      },
      get isLocal() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'local';
        }

        return isCloudMatch.test(BROWSER ? window.location.hostname : '');
      },
      envOverride: Boolean(EnvironmentOverride),
    },
    version: settingsResponse?.Version,
  };

  return settingsInformation;
};
