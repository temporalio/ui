import { BROWSER } from 'esm-env';

import type { SettingsResponse } from '$lib/types';
import type { IframeExtension, Settings } from '$lib/types/global';
import { getApiOrigin } from '$lib/utilities/get-api-origin';
import { getEnvironment } from '$lib/utilities/get-environment';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const isCloudMatch = /(tmprl\.cloud|tmprl-test\.cloud)$/;

const positiveNumberOrUndefined = (value?: number): number | undefined => {
  return typeof value === 'number' && value > 0 ? value : undefined;
};

const mapIframeExtensions = (
  settingsResponse: SettingsResponse,
): IframeExtension[] => {
  return (
    settingsResponse?.CustomUI?.IframeExtensions?.map((extension) => ({
      id: extension.ID,
      title: extension.Title || extension.ID,
      slot: extension.Slot,
      src: extension.Src,
      allowedOrigin: extension.AllowedOrigin,
      routePatterns: extension.RoutePatterns ?? [],
      sandbox: {
        allowDownloads: !!extension.Sandbox?.AllowDownloads,
        allowForms: !!extension.Sandbox?.AllowForms,
        allowModals: !!extension.Sandbox?.AllowModals,
        allowPopups: !!extension.Sandbox?.AllowPopups,
        allowPopupsToEscapeSandbox:
          !!extension.Sandbox?.AllowPopupsToEscapeSandbox,
        allowSameOrigin: !!extension.Sandbox?.AllowSameOrigin,
      },
      sizing: {
        defaultHeight: positiveNumberOrUndefined(
          extension.Sizing?.DefaultHeight,
        ),
        minHeight: positiveNumberOrUndefined(extension.Sizing?.MinHeight),
        maxHeight: positiveNumberOrUndefined(extension.Sizing?.MaxHeight),
        defaultWidth: positiveNumberOrUndefined(extension.Sizing?.DefaultWidth),
        minWidth: positiveNumberOrUndefined(extension.Sizing?.MinWidth),
        maxWidth: positiveNumberOrUndefined(extension.Sizing?.MaxWidth),
      },
      permissions: extension.Permissions ?? [],
    })) ?? []
  );
};

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
      redirectToProvider: !!settingsResponse?.Auth?.RedirectToProvider,
    },
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
    workflowPauseDisabled: !!settingsResponse?.WorkflowPauseDisabled,
    batchActionsDisabled: !!settingsResponse?.BatchActionsDisabled,
    startWorkflowDisabled: !!settingsResponse?.StartWorkflowDisabled,
    hideWorkflowQueryErrors: !!settingsResponse?.HideWorkflowQueryErrors,
    refreshWorkflowCountsDisabled:
      !!settingsResponse?.RefreshWorkflowCountsDisabled,
    activityCommandsDisabled: !!settingsResponse?.ActivityCommandsDisabled,
    customUi: {
      enabled: !!settingsResponse?.CustomUI?.Enabled,
      iframeExtensions: mapIframeExtensions(settingsResponse),
    },

    showTemporalSystemNamespace: settingsResponse?.ShowTemporalSystemNamespace,
    navCollapsedByDefault: !!settingsResponse?.NavCollapsedByDefault,
    feedbackURL: settingsResponse?.FeedbackURL,
    supportURL: settingsResponse?.SupportURL,
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
