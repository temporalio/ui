import { translate } from '$lib/i18n/translate';
import type {
  ComputeConfig,
  ComputeConfigScalingGroup,
} from '$lib/types/deployments';

/**
 * Multi-region (highly available namespace) compute config, per the HA
 * Serverless PRD.
 *
 * Scaling groups keep arbitrary user-provided names. A group with a `regionId`
 * runs only while the Namespace is active in that region; a group without one
 * is a catch-all that runs in any region. An exact `regionId` match always
 * wins over a catch-all.
 *
 * NOTE: UI-only prototype. `regionId` is not in the API yet.
 */

export type ComputeRegionRole = 'primary' | 'replica';

export type RegionMatch = 'region' | 'catch-all' | 'none';

export interface ScalingGroupEntry {
  name: string;
  regionId?: string;
  providerType?: string;
  group: ComputeConfigScalingGroup;
}

export interface RegionCoverage {
  regionId: string;
  role: ComputeRegionRole;
  match: RegionMatch;
  groups: ScalingGroupEntry[];
}

/** Strip the cloud prefix ("aws-us-east-1" -> "us-east-1") for display. */
export const shortRegion = (regionId: string): string =>
  regionId.replace(/^[a-z]+-/, '');

export const getScalingGroups = (
  computeConfig: ComputeConfig | undefined,
): ScalingGroupEntry[] =>
  Object.entries(computeConfig?.scalingGroups ?? {}).map(([name, group]) => ({
    name,
    regionId: group?.regionId || undefined,
    providerType: group?.providerType ?? group?.provider?.type,
    group,
  }));

/** True once any group is tied to a Namespace region. */
export const isMultiRegionConfig = (
  computeConfig: ComputeConfig | undefined,
): boolean =>
  getScalingGroups(computeConfig).some(({ regionId }) => !!regionId);

/**
 * Resolve which groups serve each Namespace region, following the PRD's
 * matching order: groups with a matching `regionId` first, then catch-alls.
 *
 * `namespaceRegions` must be primary-first.
 */
export const resolveRegionCoverage = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions: readonly string[],
): RegionCoverage[] => {
  const groups = getScalingGroups(computeConfig);
  const catchAll = groups.filter(({ regionId }) => !regionId);

  return namespaceRegions.map((regionId, index) => {
    const role = index === 0 ? 'primary' : 'replica';
    const exact = groups.filter((group) => group.regionId === regionId);
    if (exact.length) return { regionId, role, match: 'region', groups: exact };
    if (catchAll.length)
      return { regionId, role, match: 'catch-all', groups: catchAll };
    return { regionId, role, match: 'none', groups: [] };
  });
};

export const getUncoveredRegions = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions: readonly string[],
): string[] =>
  resolveRegionCoverage(computeConfig, namespaceRegions)
    .filter(({ match }) => match === 'none')
    .map(({ regionId }) => regionId);

/** Human-readable duration for scaler settings: 900000 -> "15m", 5000 -> "5s". */
export const formatDurationMs = (ms: number): string => {
  const units: [number, string][] = [
    [3_600_000, 'h'],
    [60_000, 'm'],
    [1_000, 's'],
  ];
  const unit = units.find(([size]) => ms >= size && ms % size === 0);
  return unit ? `${ms / unit[0]}${unit[1]}` : `${ms}ms`;
};

/** Display name for a scaling group's provider type, e.g. "AWS Lambda". */
export const computeProviderLabel = (
  providerType: string | undefined,
): string | undefined => {
  switch (providerType) {
    case 'aws-lambda':
      return translate('workers.provider-lambda');
    case 'aws-agentcore':
      return translate('workers.provider-agentcore');
    case 'gcp-cloud-run':
      return translate('workers.provider-cloud-run');
    default:
      return providerType;
  }
};

/** Short provider name shown beside its logo, e.g. "Lambda". */
export const computeProviderShortLabel = (
  providerType: string | undefined,
): string | undefined => {
  switch (providerType) {
    case 'aws-lambda':
      return translate('workers.provider-short-lambda');
    case 'aws-agentcore':
      return translate('workers.provider-short-agentcore');
    case 'gcp-cloud-run':
      return translate('workers.provider-short-cloud-run');
    default:
      return providerType;
  }
};
