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

/**
 * `per-region`: Serverless Workers in every Region. `replica-only`: the
 * customer runs their own Workers in the primary, so only the replica gets a
 * scaling group and Serverless Workers run only after failover.
 */
export type RegionCoverageMode = 'per-region' | 'replica-only';

export interface ComputeRegion {
  /**
   * Temporal Cloud: the full region id, e.g. "aws-us-east-1".
   * Self-hosted: the cluster id.
   */
  id: string;
  role?: ComputeRegionRole;
  /** The compute provider for this region, derived from the region's cloud. */
  provider: ComputeProviderValue;
}

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
  role?: ComputeRegionRole;
  /** The customer's own Workers serve this Region. */
  selfManaged: boolean;
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
  role: region.role,
  selfManaged: false,
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
