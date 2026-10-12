import {
  COMPUTE_PROVIDER_VALUES,
  type ComputeProviderValue,
} from '$lib/components/workers/serverless-worker-form/compute-providers';
import type { ComputeProviderOption } from '$lib/components/workers/serverless-worker-form/shared';
import type {
  ComputeRegionRole,
  NamespaceRegion,
} from '$lib/utilities/compute-regions';

const ROLES: ReadonlySet<string> = new Set<ComputeRegionRole>([
  'primary',
  'replica',
]);

/**
 * Reads `regionId:role` pairs separated by commas, for example
 * `aws-us-east-1:primary,aws-us-west-2:replica`. Entries without a region or
 * with an unknown role are skipped.
 */
export const parseNamespaceRegions = (
  value: string | undefined,
): NamespaceRegion[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim().split(':'))
    .filter(([regionId, role]) => !!regionId && ROLES.has(role))
    .map(([regionId, role]) => ({
      regionId,
      role: role as ComputeRegionRole,
    }));

/**
 * Namespace regions from the environment, standing in for the ones a consumer
 * passes. The open-source server has no region of its own, so this is how a
 * development build or a feature demo sees the multi-region UI. A production
 * build never reads it.
 */
export const namespaceRegionsFromEnv = (): NamespaceRegion[] =>
  import.meta.env.DEV
    ? parseNamespaceRegions(import.meta.env.VITE_NAMESPACE_REGIONS)
    : [];

const PROVIDERS: ReadonlySet<string> = new Set(COMPUTE_PROVIDER_VALUES);

/**
 * Reads `provider:regionId` pairs separated by commas, for example
 * `lambda:aws-us-west-2,lambda:aws-us-west-1`, into every provider with the
 * replica regions it was given. Returns undefined when no pair is valid, which
 * leaves the form's default providers in place.
 */
export const parseReplicaRegions = (
  value: string | undefined,
): ComputeProviderOption[] | undefined => {
  const pairs = (value ?? '')
    .split(',')
    .map((entry) => entry.trim().split(':'))
    .filter(([provider, regionId]) => PROVIDERS.has(provider) && !!regionId);
  if (!pairs.length) return undefined;
  return COMPUTE_PROVIDER_VALUES.map((value: ComputeProviderValue) => ({
    value,
    replicaRegions: pairs
      .filter(([provider]) => provider === value)
      .map(([, regionId]) => ({ regionId })),
  }));
};

/**
 * Providers with replica regions from the environment, standing in for the
 * ones a consumer passes. A production build never reads it.
 */
export const computeProvidersFromEnv = ():
  | ComputeProviderOption[]
  | undefined =>
  import.meta.env.DEV
    ? parseReplicaRegions(import.meta.env.VITE_REPLICA_REGIONS)
    : undefined;
