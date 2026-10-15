import { BROWSER } from 'esm-env';

import {
  isTemporalExtensionPermission,
  isTemporalExtensionSlot,
} from '$lib/extensions/iframe-extensions';
import type { CustomUIResponse, SettingsResponse } from '$lib/types';
import type {
  BannerSettings,
  IframeExtension,
  Settings,
} from '$lib/types/global';
import { getApiOrigin } from '$lib/utilities/get-api-origin';
import { getEnvironment } from '$lib/utilities/get-environment';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const isCloudMatch = /(tmprl\.cloud|tmprl-test\.cloud)$/;

export const isLocalRuntimeEnvironment = ({
  environmentOverride,
  hostname,
}: {
  environmentOverride: string | null;
  hostname: string;
}) => {
  if (environmentOverride) return environmentOverride === 'local';
  return !isCloudMatch.test(hostname);
};

const emptySettingsResponse: SettingsResponse = {
  Auth: {
    Enabled: false,
    Options: null,
  },
  Codec: {
    Endpoint: '',
  },
  DefaultNamespace: '',
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
  NavCollapsedByDefault: false,
  FeedbackURL: '',
  DisableNewsFetch: false,
  Version: '',
};

const positiveNumberOrUndefined = (value?: number): number | undefined => {
  return typeof value === 'number' && value > 0 ? value : undefined;
};

const mapIframeExtensions = (
  customUIResponse: CustomUIResponse | undefined,
): IframeExtension[] => {
  return (
    customUIResponse?.IframeExtensions?.flatMap((extension) => {
      if (!isTemporalExtensionSlot(extension.Slot)) return [];
      const permissions = (extension.Permissions ?? []).filter(
        isTemporalExtensionPermission,
      );
      if (permissions.length !== (extension.Permissions ?? []).length) {
        return [];
      }

      return [
        {
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
            allowSameOrigin: !!extension.Sandbox?.AllowSameOrigin,
          },
          sizing: {
            defaultHeight: positiveNumberOrUndefined(
              extension.Sizing?.DefaultHeight,
            ),
            minHeight: positiveNumberOrUndefined(extension.Sizing?.MinHeight),
            maxHeight: positiveNumberOrUndefined(extension.Sizing?.MaxHeight),
            defaultWidth: positiveNumberOrUndefined(
              extension.Sizing?.DefaultWidth,
            ),
            minWidth: positiveNumberOrUndefined(extension.Sizing?.MinWidth),
            maxWidth: positiveNumberOrUndefined(extension.Sizing?.MaxWidth),
          },
          permissions,
        },
      ];
    }) ?? []
  );
};

export const fetchUiExtensions = async (
  request = fetch,
): Promise<IframeExtension[]> => {
  try {
    const route = routeForApi('ui-extensions');
    const customUIResponse: CustomUIResponse | undefined = await requestFromAPI(
      route,
      {
        request,
        notifyOnError: false,
      },
    );
    if (!customUIResponse?.Enabled) return [];
    return mapIframeExtensions(customUIResponse);
  } catch {
    return [];
  }
};

const normalizeBanner = (banner: unknown): BannerSettings => {
  const hidden: BannerSettings = { text: '', color: 'info' };
  if (
    !banner ||
    typeof banner !== 'object' ||
    !('Text' in banner) ||
    !('Color' in banner) ||
    typeof banner.Text !== 'string' ||
    typeof banner.Color !== 'string'
  )
    return hidden;

  const text = banner.Text.trim();
  const color = banner.Color.trim().toLowerCase();
  if (!text || /[\p{Cc}"'&:]/u.test(banner.Text)) return hidden;

  switch (color) {
    case 'info':
    case 'warning':
    case 'success':
    case 'error':
      return { text, color };
    default:
      return hidden;
  }
};

export const fetchSettings = async (request = fetch): Promise<Settings> => {
  const route = routeForApi('settings');
  const settingsResponse: SettingsResponse =
    (await requestFromAPI<SettingsResponse>(route, {
      request,
    })) ?? emptySettingsResponse;

  const EnvironmentOverride = getEnvironment();

  const settingsInformation = {
    banner: normalizeBanner(settingsResponse?.Banner),
    auth: {
      enabled: !!settingsResponse?.Auth?.Enabled,
      options: settingsResponse?.Auth?.Options,
      redirectToProvider: !!settingsResponse?.Auth?.RedirectToProvider,
    },
    baseUrl: getApiOrigin() ?? '',
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
      iframeExtensions: [],
    },

    showTemporalSystemNamespace: settingsResponse?.ShowTemporalSystemNamespace,
    navCollapsedByDefault: !!settingsResponse?.NavCollapsedByDefault,
    feedbackURL: settingsResponse?.FeedbackURL,
    disableNewsFetch: !!settingsResponse?.DisableNewsFetch,
    notifyOnNewVersion: !!settingsResponse?.NotifyOnNewVersion,
    distribution: settingsResponse?.Distribution,
    distributionVersion: settingsResponse?.DistributionVersion,
    supportURL: settingsResponse?.SupportURL,
    runtimeEnvironment: {
      get isCloud() {
        if (EnvironmentOverride) {
          return EnvironmentOverride === 'cloud';
        }

        return isCloudMatch.test(BROWSER ? window.location.hostname : '');
      },
      get isLocal() {
        return isLocalRuntimeEnvironment({
          environmentOverride: EnvironmentOverride,
          hostname: BROWSER ? window.location.hostname : '',
        });
      },
      envOverride: Boolean(EnvironmentOverride),
    },
    version: settingsResponse?.Version,
  };

  return settingsInformation;
};
