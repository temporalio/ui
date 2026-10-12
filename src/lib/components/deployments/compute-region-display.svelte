<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconWarning } from '$lib/io/icon';
  import type { ComputeConfig } from '$lib/types/deployments';
  import {
    getScalingGroups,
    type NamespaceRegion,
    resolveRegionCoverage,
  } from '$lib/utilities/compute-regions';

  interface Props {
    computeConfig: ComputeConfig | undefined;
    /**
     * The Namespace's regions. A consumer passes these when its own
     * entitlement says the Namespace is highly available; fewer than two
     * shows no regions. Each region states its own role rather than relying
     * on list order.
     */
    namespaceRegions?: readonly NamespaceRegion[];
    scrollContainer?: string;
  }

  let {
    computeConfig,
    namespaceRegions = [],
    scrollContainer,
  }: Props = $props();

  const coverage = $derived.by(() => {
    if (namespaceRegions.length > 1) {
      return resolveRegionCoverage(computeConfig, namespaceRegions).map(
        ({ regionId, label, role, match }) => ({
          regionId,
          label,
          role,
          covered: match !== 'none',
        }),
      );
    }
    const regionIds = [
      ...new Set(
        getScalingGroups(computeConfig).flatMap(({ regionIds }) => regionIds),
      ),
    ];
    // A scaling group's own regionId arrives without a label to resolve, so
    // it is shown as the API spelled it.
    return regionIds.map((regionId, index) => ({
      regionId,
      label: regionId,
      role: index === 0 ? 'primary' : 'replica',
      covered: true,
    }));
  });

  const covered = $derived(coverage.filter((region) => region.covered));
  const uncovered = $derived(coverage.filter((region) => !region.covered));
  /** Roles are only meaningful once a Namespace spans more than one Region. */
  const showRegionRoles = $derived(coverage.length > 1);
  const uncoveredLabel = $derived(
    translate('workers.region-not-configured-in', {
      regions: uncovered.map(({ label }) => label).join(', '),
    }),
  );
</script>

{#if coverage.length}
  <div
    class="-ml-px inline-flex items-center gap-1 text-nowrap border border-primary px-1"
  >
    {#each covered as region, index (region.regionId)}
      {@const isLast = index === covered.length - 1}
      <Tooltip
        text={region.role === 'replica'
          ? translate('workers.region-role-replica')
          : translate('workers.region-role-primary')}
        hide={!showRegionRoles}
        top
        usePortal
        {scrollContainer}
      >
        <span class="font-medium">{region.label}</span>{isLast ? '' : ','}
      </Tooltip>
    {/each}
    {#if uncovered.length}
      <Tooltip text={uncoveredLabel} top usePortal {scrollContainer}>
        <span class="inline-flex items-center">
          <IconWarning width={14} height={14} class="text-warning" />
          <span class="sr-only">{uncoveredLabel}</span>
        </span>
      </Tooltip>
    {/if}
  </div>
{/if}
