import {
  COMPUTE_PROVIDERS,
  computeProviderFromType,
} from '$lib/components/workers/serverless-worker-form/compute-providers';
import { translate } from '$lib/i18n/translate';
import type {
  ComputeConfig,
  ComputeConfigScalingGroup,
} from '$lib/types/deployments';

/**
 * Which scaling groups serve which Namespace region, for highly available
 * Namespaces, per the HA Serverless PRD.
 *
 * ## What decides whether any of this is shown
 *
 * `namespaceRegions`, and nothing else. This repo does not decide whether an
 * install has highly available Namespaces: a consumer passes the regions when
 * its own entitlement says so, the same way it passes the compute providers a
 * Namespace may use. An empty or single-entry list means single region, which
 * is every self-hosted install and every Namespace without HA.
 *
 * That is deliberately the only switch. A scaling group carrying a `regionId`
 * does not by itself make a deployment multi-region — a single-region Namespace
 * with a stray `regionId` is still single region — so there is one question to
 * ask and one answer, rather than two conditions that can disagree.
 * `hasRegionScopedGroups` asks the other question, about the config's shape,
 * and is kept separate for that reason.
 *
 * ## Region identifiers
 *
 * A `regionId` is a cloud provider and a region name joined by a hyphen, as in
 * `aws-us-west-2` or `gcp-us-central1`. That is the spelling Temporal Cloud
 * already uses for a Namespace's replica regions, so the two sides join on it
 * directly. It is a plain string rather than a structured value because
 * `ComputeConfigScalingGroup.region_id` is one, and a Namespace is in a single
 * cloud today, so the provider is never ambiguous within one Namespace.
 */

/** A Namespace is active in one region at a time; the rest hold replicas. */
export type ComputeRegionRole = 'primary' | 'replica';

/**
 * One of a Namespace's regions.
 *
 * The role is given rather than inferred from position. A caller already knows
 * which region is active — Temporal Cloud reads it from the replica's mode —
 * and an ordering convention is a rule that can be broken silently, where a
 * named role cannot. The form side of this feature already states the role on
 * its own region type, so stating it here keeps the two halves in step.
 *
 * `regionId` rather than `id` because it joins against
 * `ComputeConfigScalingGroup.region_id`.
 */
export interface NamespaceRegion {
  regionId: string;
  role?: ComputeRegionRole;
}

/**
 * How a region found its groups. `catch-all` is the pre-HA shape: a group with
 * no `regionId` runs wherever the Namespace is active.
 */
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

/**
 * Whether to show a deployment as multi-region.
 *
 * One region is not multi-region, and neither is none. See the note above on
 * why the compute config does not get a vote.
 */
export const isMultiRegion = (
  namespaceRegions: readonly NamespaceRegion[] | undefined,
): boolean => (namespaceRegions?.length ?? 0) > 1;

/** Strips the cloud prefix for display: "aws-us-east-1" becomes "us-east-1". */
export const shortRegion = (regionId: string): string =>
  regionId.replace(/^[a-z]+-/, '');

export const getScalingGroups = (
  computeConfig: ComputeConfig | undefined,
): ScalingGroupEntry[] =>
  Object.entries(computeConfig?.scalingGroups ?? {}).map(([name, group]) => ({
    name,
    // An empty string is how the API spells "unset", and it must read as a
    // catch-all rather than as a region no Namespace has.
    regionId: group?.regionId || undefined,
    providerType: group?.providerType ?? group?.provider?.type,
    group,
  }));

/**
 * Whether any scaling group names a region.
 *
 * This is a question about the compute config's shape, not about the Namespace,
 * and it is the one the per-group details table asks: a table that gives each
 * group a column needs to know whether those columns have regions to be headed
 * with. It deliberately does not decide whether to show region coverage —
 * `isMultiRegion` does that.
 */
export const hasRegionScopedGroups = (
  computeConfig: ComputeConfig | undefined,
): boolean =>
  getScalingGroups(computeConfig).some(({ regionId }) => !!regionId);

/**
 * The groups serving each Namespace region, in the PRD's matching order: an
 * exact `regionId` first, then any catch-all.
 *
 * Order does not matter: each region carries its own role.
 */
export const resolveRegionCoverage = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions: readonly NamespaceRegion[],
): RegionCoverage[] => {
  const groups = getScalingGroups(computeConfig);
  const catchAll = groups.filter(({ regionId }) => !regionId);

  return namespaceRegions.map(({ regionId, role = 'replica' }) => {
    const exact = groups.filter((group) => group.regionId === regionId);

    if (exact.length) return { regionId, role, match: 'region', groups: exact };
    if (catchAll.length) {
      return { regionId, role, match: 'catch-all', groups: catchAll };
    }
    return { regionId, role, match: 'none', groups: [] };
  });
};

/**
 * Regions no group serves. These are the ones worth warning about: the
 * Namespace can fail over to them and find no workers.
 */
export const getUncoveredRegions = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions: readonly NamespaceRegion[],
): string[] =>
  resolveRegionCoverage(computeConfig, namespaceRegions)
    .filter(({ match }) => match === 'none')
    .map(({ regionId }) => regionId);

/**
 * The provider's full name, e.g. "AWS Lambda".
 *
 * Read from the registry rather than restated, so a provider stays described in
 * one place. Falls back to the raw type for a provider this UI does not know,
 * which is better than an empty cell.
 */
export const computeProviderLabel = (
  providerType: string | undefined,
): string | undefined => {
  const provider = computeProviderFromType(providerType);
  return provider
    ? translate(COMPUTE_PROVIDERS[provider].labelKey)
    : providerType;
};

/** The provider's short name for a badge, e.g. "Lambda". Also from the registry. */
export const computeProviderShortLabel = (
  providerType: string | undefined,
): string | undefined => {
  const provider = computeProviderFromType(providerType);
  return provider ? COMPUTE_PROVIDERS[provider].badgeLabel : providerType;
};

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
