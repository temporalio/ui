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
 * The Namespace regions for a feature demo. The open-source server has no
 * region of its own, so only a consumer can supply real regions. A demo sets
 * VITE_DEMO_NAMESPACE_REGIONS instead. A production build never reads it.
 */
export const demoNamespaceRegions = (): NamespaceRegion[] =>
  import.meta.env.DEV
    ? parseNamespaceRegions(import.meta.env.VITE_DEMO_NAMESPACE_REGIONS)
    : [];
