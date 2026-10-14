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
 * `ComputeProviderConfig.regions`, and nothing else. This repo does not decide
 * whether an install has highly available Namespaces: a consumer passes the
 * regions in the same config as the compute providers a Namespace may use.
 * An empty or single-entry list means single region, which is every
 * self-hosted install, because its server has no host region for `region_ids`
 * to match, and every Namespace without HA.
 *
 * That is deliberately the only switch. A scaling group naming a region does
 * not by itself make a deployment multi-region — a single-region Namespace
 * with a stray `region_ids` entry is still single region — so there is one
 * question to ask and one answer, rather than two that can disagree.
 * `hasRegionScopedGroups` asks the other question, about the config's shape,
 * and is kept separate for that reason.
 *
 * ## Region identifiers
 *
 * Opaque strings, compared only for equality. This repo does not parse one,
 * because it does not own the format: Temporal Cloud spells a region
 * `aws-us-west-2` while a self-hosted cluster is named whatever its operator
 * named it. Both sides of the join use the same strings, which is all the
 * matching needs. See `NamespaceRegion.label` for display.
 *
 * `ComputeConfigScalingGroup.region_ids` is repeated, so a group can serve
 * several regions. A group serves a region by listing it, and a group that
 * lists none is a catch-all.
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
  /**
   * What to show for this region. Defaults to `regionId`.
   *
   * This repo does not parse a region identifier, because it does not own the
   * format. Temporal Cloud spells one `aws-us-west-2` and would rather show
   * `us-west-2`; a self-hosted cluster is named whatever its operator named
   * it, and splitting that on a hyphen turns `us-east-1` into `east-1`.
   * Whoever supplies the identifier knows how to shorten it, so they supply
   * the label too.
   */
  label?: string;
}

/**
 * How a region found its groups. `catch-all` is the pre-HA shape: a group
 * naming no regions runs wherever the Namespace is active.
 */
export type RegionMatch = 'region' | 'catch-all' | 'none';

export interface ScalingGroupEntry {
  name: string;
  /** Empty means a catch-all: the group runs wherever the Namespace is active. */
  regionIds: string[];
  providerType?: string;
  group: ComputeConfigScalingGroup;
}

export interface RegionCoverage {
  regionId: string;
  /** `NamespaceRegion.label` when one was given, otherwise `regionId`. */
  label: string;
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

export const getScalingGroups = (
  computeConfig: ComputeConfig | undefined,
): ScalingGroupEntry[] =>
  Object.entries(computeConfig?.scalingGroups ?? {}).map(([name, group]) => ({
    name,
    // An empty string is how the API spells "unset" for a scalar, and the same
    // care applies here: a blank entry must not read as a region no Namespace
    // has. Dropping them leaves an empty list, which is the catch-all.
    regionIds: (group?.regionIds ?? []).filter(Boolean),
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
  getScalingGroups(computeConfig).some(({ regionIds }) => regionIds.length > 0);

/**
 * The groups serving each Namespace region: those naming it in `regionIds`
 * first, then any catch-all.
 *
 * Order does not matter: each region carries its own role.
 */
export const resolveRegionCoverage = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions: readonly NamespaceRegion[],
): RegionCoverage[] => {
  const groups = getScalingGroups(computeConfig);
  const catchAll = groups.filter(({ regionIds }) => regionIds.length === 0);

  return namespaceRegions.map(({ regionId, role = 'replica', label }) => {
    const shown = label ?? regionId;
    // `region_ids` is repeated, so a group serves a region by listing it among
    // others, not by being equal to it.
    const exact = groups.filter(({ regionIds }) =>
      regionIds.includes(regionId),
    );

    if (exact.length) {
      return { regionId, label: shown, role, match: 'region', groups: exact };
    }
    if (catchAll.length) {
      return {
        regionId,
        label: shown,
        role,
        match: 'catch-all',
        groups: catchAll,
      };
    }
    return { regionId, label: shown, role, match: 'none', groups: [] };
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
