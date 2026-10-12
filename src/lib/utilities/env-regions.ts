import type {
  ComputeRegionRole,
  NamespaceRegion,
} from '$lib/utilities/compute-regions';

const ROLES: ReadonlySet<string> = new Set<ComputeRegionRole>([
  'primary',
  'replica',
]);

/** `regionId` or `regionId=label`, the label being the provider's own name. */
const region = (value: string): { regionId: string; label?: string } => {
  const [regionId, label] = value.split('=');
  return label ? { regionId, label } : { regionId };
};

/**
 * Reads `region:role` pairs separated by commas, where a region is `regionId`
 * or `regionId=label`, for example
 * `aws-us-east-1=us-east-1:primary,aws-us-west-2=us-west-2:replica`. Entries
 * without a region or with an unknown role are skipped.
 */
export const parseNamespaceRegions = (
  value: string | undefined,
): NamespaceRegion[] =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim().split(':'))
    .filter(
      ([value, role]) => !!region(value ?? '').regionId && ROLES.has(role),
    )
    .map(([value, role]) => ({
      ...region(value),
      role: role as ComputeRegionRole,
    }));

/**
 * Namespace regions from the environment, for a development build or a
 * feature demo whose server cannot provide them, such as a single-cluster dev
 * server. Undefined when unset, so the Namespace's own regions are used. A
 * production build never reads it.
 */
export const namespaceRegionsFromEnv = (): NamespaceRegion[] | undefined => {
  if (!import.meta.env.DEV) return undefined;
  const regions = parseNamespaceRegions(import.meta.env.VITE_NAMESPACE_REGIONS);
  return regions.length ? regions : undefined;
};
