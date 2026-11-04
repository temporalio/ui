import type { ComputeConfig } from '$lib/types/deployments';
import {
  getScalingGroups,
  type NamespaceRegion,
  type ScalingGroupEntry,
} from '$lib/utilities/compute-regions';

import type { ComputeProviderValue } from './shared';

/**
 * Multi-region (highly available namespace) support for Serverless Workers.
 *
 * A highly available namespace runs in more than one region, each already
 * defined by the namespace's primary + replica configuration. The regions and
 * their compute provider are derived from the namespace — the user does not
 * choose them; they pick one compute provider and supply its credentials plus
 * the per-region resource. Temporal invokes the provider that matches the
 * active region.
 *
 * NOTE: this is a UI-only prototype; no API contract is assumed.
 */

export type ComputeRegionRole = 'primary' | 'replica';

export interface ComputeRegion {
  /**
   * Temporal Cloud: the full region id, e.g. "aws-us-east-1".
   * Self-hosted: the cluster id.
   */
  id: string;
  role?: ComputeRegionRole;
  /** What to show. Defaults to `id`. */
  label?: string;
  /**
   * The Region segment of a regional resource like a Lambda ARN. Whoever
   * supplies the identifier owns its format and so supplies this; this repo
   * does not split it.
   */
  providerRegion?: string;
  /** The compute provider for this region, derived from the region's cloud. */
  provider: ComputeProviderValue;
}

/**
 * The form's regions for a Namespace's regions, primary first. The form reads
 * its first region as the primary, while a Namespace region states its own
 * role and can arrive in any order.
 */
export const computeRegionsFor = (
  namespaceRegions: readonly NamespaceRegion[],
  provider: ComputeProviderValue,
): ComputeRegion[] =>
  [...namespaceRegions]
    .sort((a, b) => Number(b.role === 'primary') - Number(a.role === 'primary'))
    .map(({ regionId, role = 'replica', label, providerRegion }) => ({
      id: regionId,
      role,
      label,
      providerRegion,
      provider,
    }));

/**
 * Suggest the same resource in another Region by swapping the Region segment
 * of an AWS ARN ("arn:aws:lambda:us-east-1:..." -> "arn:aws:lambda:us-west-2:...").
 * Returns '' when the ARN has no Region segment to swap.
 */
export const suggestRegionalArn = (arn: string, region: string): string => {
  const match = arn.match(/^(arn:[^:]+:[^:]+:)[a-z]{2}(-[a-z]+)+-\d+(:.*)$/);
  return match ? `${match[1]}${region}${match[3]}` : '';
};

/** An example Lambda ARN in the given Region; the default placeholder otherwise. */
export const lambdaArnPlaceholderFor = (
  region: string | undefined,
): string | undefined =>
  region
    ? `arn:aws:lambda:${region}:123456789012:function:orders-worker`
    : undefined;

/** How a preview slot got its value. */
export type PreviewSlotState = 'set' | 'suggested' | 'inherited' | 'missing';

export interface PreviewSlot {
  /** Short, human-readable form of the value, e.g. "orders-worker:17". */
  value: string;
  /** The value as entered, e.g. the full ARN. */
  full?: string;
  state: PreviewSlotState;
}

export interface PreviewRegion {
  regionId: string;
  label: string;
  role?: ComputeRegionRole;
  /** False when this region runs no Serverless Workers. */
  serverless: boolean;
  resource: PreviewSlot;
  access: PreviewSlot;
}

/**
 * The part of an ARN a person recognizes: the function and qualifier of a
 * Lambda ARN, or the last path segment of any other ARN or resource name.
 */
export const shortResourceName = (value: string): string => {
  const lambda = value.match(/:function:(.+)$/);
  if (lambda) return lambda[1];
  const segments = value.split(/[/:]/).filter(Boolean);
  return segments[segments.length - 1] ?? value;
};

export const previewSlot = (
  value: string,
  state: Exclude<PreviewSlotState, 'missing'> = 'set',
): PreviewSlot =>
  value
    ? { value: shortResourceName(value), full: value, state }
    : { value: '', state: 'missing' };

interface PreviewFields {
  lambdaArn: string;
  agentCoreEndpointArn: string;
  gcpWorkerPool: string;
  iamRoleArn: string;
  gcpServiceAccount: string;
}

/** The field that names the resource Temporal invokes, per provider. */
export const resourceValue = (
  provider: ComputeProviderValue,
  fields: PreviewFields,
): string =>
  ({
    lambda: fields.lambdaArn,
    agentcore: fields.agentCoreEndpointArn,
    'cloud-run': fields.gcpWorkerPool,
  })[provider];

/** The identity Temporal uses to invoke it, per provider. */
export const accessValue = (
  provider: ComputeProviderValue,
  fields: PreviewFields,
): string =>
  provider === 'cloud-run' ? fields.gcpServiceAccount : fields.iamRoleArn;

export const regionPreview = (
  region: ComputeRegion,
  provider: ComputeProviderValue,
  fields: PreviewFields,
): PreviewRegion => ({
  regionId: region.id,
  label: region.label ?? region.id,
  role: region.role,
  serverless: true,
  resource: previewSlot(resourceValue(provider, fields)),
  access: previewSlot(accessValue(provider, fields)),
});

/**
 * Shorten a long identifier by keeping its start and end, where the
 * distinguishing characters of a UUID or hash usually are.
 */
export const truncateMiddle = (value: string, maxLength = 16): string => {
  if (value.length <= maxLength) return value;
  const keep = maxLength - 1;
  const head = Math.ceil(keep / 2);
  return `${value.slice(0, head)}…${value.slice(value.length - (keep - head))}`;
};

/**
 * The region a server error names, with the rest of the message. The worker
 * controller prefixes a scaling group's error with the group's key, and a
 * multi-region Version keys each group by its region.
 */
export const regionServerErrors = (
  error: string | undefined,
  regions: readonly ComputeRegion[] | undefined,
): Record<string, string> => {
  if (!error || !regions?.length) return {};
  // The primary saves as the default group, so its errors carry that key.
  const keys = [
    ...regions.map(({ id }) => ({ key: id, regionId: id })),
    { key: 'default', regionId: regions[0].id },
  ];
  const match = keys.find(({ key }) => error.startsWith(`${key}: `));
  return match ? { [match.regionId]: error.slice(match.key.length + 2) } : {};
};

/** The region segment of an ARN: arn:partition:service:REGION:account:… */
const ARN_REGION = /^arn:[^:]+:[^:]+:([a-z0-9-]+):/;

/**
 * The region a resource runs in, as its provider names it: the region in a
 * Lambda or AgentCore ARN, or a Cloud Run worker pool's region. Undefined
 * until the field holds one.
 */
export const resourceRegion = (
  provider: ComputeProviderValue,
  fields: {
    lambdaArn: string;
    agentCoreEndpointArn: string;
    gcpRegion: string;
  },
): string | undefined => {
  if (provider === 'cloud-run') return fields.gcpRegion || undefined;
  const arn =
    provider === 'agentcore' ? fields.agentCoreEndpointArn : fields.lambdaArn;
  return arn.match(ARN_REGION)?.[1];
};

/**
 * The offered replica region a resource runs in. Matched on the provider's
 * own name for the region, so this repo never builds a region id from a
 * resource.
 */
export const replicaRegionFor = (
  region: string | undefined,
  options: readonly ComputeRegion[],
): ComputeRegion | undefined =>
  region
    ? options.find(({ providerRegion }) => providerRegion === region)
    : undefined;

/**
 * The saved groups a new config leaves out. The form writes at most two
 * groups, `default` and the replica's, so an edit removes every other group:
 * one saved under another name, or one made through the API. The saved config
 * then matches what the form shows.
 */
export const scalingGroupsToRemove = (
  saved: ComputeConfig | undefined,
  next: ComputeConfig,
): string[] =>
  Object.keys(saved?.scalingGroups ?? {}).filter(
    (name) => !(name in (next.scalingGroups ?? {})),
  );

/**
 * A saved config as the high availability form sees it: the primary is the
 * unscoped group, and the replica is the group scoped to the Namespace's
 * replica. A config saved another way still reads: a group scoped to some
 * other region stands in for the primary.
 */
export const splitHighAvailabilityGroups = (
  computeConfig: ComputeConfig | undefined,
  replicaRegionId: string | undefined,
): { primary?: ScalingGroupEntry; replica?: ScalingGroupEntry } => {
  const groups = getScalingGroups(computeConfig);
  const replica = replicaRegionId
    ? groups.find(({ regionIds }) => regionIds.includes(replicaRegionId))
    : undefined;
  const others = groups.filter((group) => group !== replica);
  const primary =
    others.find(({ regionIds }) => regionIds.length === 0) ?? others[0];
  return { primary, replica };
};
