import type { ClusterInformation, UiVersionInfo } from '$lib/types/global';

export enum BannersState {
  TemporalVersion = 1,
  UIVersion = 2,
}

export const isTemporalVersionBanner = (state: BannersState): boolean => {
  return state === BannersState.TemporalVersion;
};

export const isUIVersionBanner = (state: BannersState): boolean => {
  return state === BannersState.UIVersion;
};

export const getLinkForTemporalVersion = (
  cluster: ClusterInformation,
): string => {
  return `https://github.com/temporalio/temporal/releases/tag/v${cluster.versionInfo.recommended.version}`;
};

export const getLinkForUIVersion = (uiVersionInfo: UiVersionInfo): string => {
  return `https://github.com/temporalio/ui-server/releases/tag/v${uiVersionInfo?.recommended}`;
};
