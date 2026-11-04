import type { ComputeProviderValue } from '$lib/components/workers/serverless-worker-form/compute-providers';
import type { ComputeProviderOption } from '$lib/components/workers/serverless-worker-form/shared';
import type { NamespaceRegion } from '$lib/utilities/compute-regions';

/**
 * A compute provider a Namespace may use, with the facts that belong to that
 * provider alone.
 */
export type ComputeProviderConfigOption = ComputeProviderOption & {
  /**
   * Where this provider's compute can be deployed, such as the GCP regions a
   * Cloud Run service can run in. Omit it to offer the provider's defaults.
   * This is not where the Namespace lives: see `ComputeProviderConfig.regions`.
   */
  deployRegions?: readonly string[];
};

/**
 * Everything the worker deployment pages need to know about a Namespace's
 * compute, built once per Namespace by whoever hosts the pages.
 *
 * Temporal Cloud builds it from its Namespace: the Namespace's cloud decides
 * the providers, and its regions and replicas decide `regions`. A self-hosted
 * install passes no regions, because its server has no host region for a
 * scaling group's `region_ids` to match.
 */
export interface ComputeProviderConfig {
  /**
   * The providers this Namespace may use. Omit it to offer every provider.
   */
  providers?: readonly ComputeProviderConfigOption[];
  /**
   * Where this Namespace lives. Two or more turn on high availability: the
   * forms collect compute per region, and the deployment pages show the
   * regions each Version covers. Fewer than two is single region.
   */
  regions?: readonly NamespaceRegion[];
}

const NO_REGIONS: readonly NamespaceRegion[] = [];

export const configuredRegions = (
  config: ComputeProviderConfig | undefined,
): readonly NamespaceRegion[] => config?.regions ?? NO_REGIONS;

export const deployRegionsFor = (
  config: ComputeProviderConfig | undefined,
  provider: ComputeProviderValue,
): string[] | undefined => {
  const regions = config?.providers?.find(
    ({ value }) => value === provider,
  )?.deployRegions;
  return regions ? [...regions] : undefined;
};
