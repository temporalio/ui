<script lang="ts">
  import {
    COMPUTE_PROVIDERS,
    computeProviderFromType,
  } from '$lib/components/workers/serverless-worker-form/compute-providers';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ComputeConfig, ComputeStatus } from '$lib/types/deployments';
  import {
    computeProviderLabel,
    computeProviderShortLabel,
    getScalingGroups,
    type NamespaceRegion,
    type RegionMatch,
    resolveRegionCoverage,
  } from '$lib/utilities/compute-regions';
  import {
    type ConnectionState,
    connectionStateLabel,
    connectionTooltip,
    deriveConnectionStatus,
  } from '$lib/utilities/connection-status';

  interface Props {
    computeConfig: ComputeConfig | undefined;
    /**
     * The Namespace's regions. A consumer passes these when its own
     * entitlement says the Namespace is highly available; fewer than two
     * shows no regions. Each region states its own role rather than relying
     * on list order.
     */
    namespaceRegions?: readonly NamespaceRegion[];
    /**
     * Version-level connection status. The API reports one per version, so
     * it colors every Region the version covers.
     */
    computeStatus?: ComputeStatus;
    showConnectionStatus?: boolean;
  }

  let {
    computeConfig,
    namespaceRegions = [],
    computeStatus,
    showConnectionStatus = false,
  }: Props = $props();

  const state = $derived<ConnectionState | undefined>(
    showConnectionStatus && computeStatus
      ? deriveConnectionStatus(computeStatus)
      : undefined,
  );

  /** Region segment colors: a missing Region wins, then the connection. */
  const regionTone = (uncovered: boolean): string => {
    if (uncovered) return 'border-warning bg-surface-warning text-warning';
    if (state === 'connected')
      return 'border-success bg-surface-success text-success';
    if (state === 'failed')
      return 'border-danger bg-surface-danger text-danger';
    return 'border-tertiary bg-surface-tertiary text-secondary';
  };

  const groups = $derived(getScalingGroups(computeConfig));
  const isMultiRegion = $derived(namespaceRegions.length > 1);

  type Row = {
    key: string;
    label?: string;
    role: string;
    match: RegionMatch;
    providerType?: string;
  };

  const rows = $derived.by((): Row[] => {
    if (namespaceRegions.length) {
      return resolveRegionCoverage(computeConfig, namespaceRegions).map(
        (coverage) => ({
          key: coverage.regionId,
          label: coverage.label,
          role: coverage.role,
          match: coverage.match,
          providerType: coverage.groups[0]?.providerType,
        }),
      );
    }
    // No Namespace regions to resolve against, so each group speaks for
    // itself. A group naming several regions is shown once per region, because
    // a row stands for a place workers run.
    return groups.flatMap((group, index) =>
      (group.regionIds.length ? group.regionIds : [undefined]).map(
        (regionId) => ({
          key: `${group.name}:${regionId ?? ''}`,
          label: regionId,
          role: index === 0 ? 'primary' : 'replica',
          match: regionId ? ('region' as const) : ('catch-all' as const),
          providerType: group.providerType,
        }),
      ),
    );
  });

  const roleLabel = (role: string): string =>
    role === 'replica'
      ? translate('workers.region-role-replica')
      : translate('workers.region-role-primary');
</script>

{#if rows.length}
  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
    {#each rows as row (row.key)}
      {@const uncovered = row.match === 'none'}
      {@const rowProvider = computeProviderFromType(row.providerType)}
      {@const RowIcon = rowProvider
        ? COMPUTE_PROVIDERS[rowProvider].icon
        : undefined}
      {@const rowShortLabel = computeProviderShortLabel(row.providerType)}
      {@const tooltip =
        row.match === 'none'
          ? translate('workers.region-not-configured-tooltip')
          : [
              computeProviderLabel(row.providerType) ?? '',
              state ? connectionStateLabel(state) : '',
              state ? connectionTooltip(computeStatus) : '',
            ]
              .filter(Boolean)
              .join(' · ')}
      {@const detail = row.label ?? (state ? connectionStateLabel(state) : '')}
      {#if detail || rowShortLabel}
        <Tooltip text={tooltip} hide={!tooltip} topLeft width={260} usePortal>
          {@const tone = regionTone(uncovered)}
          <span
            class="inline-flex whitespace-nowrap rounded-full border font-mono text-xs font-medium uppercase leading-none {tone}"
            data-region-role={isMultiRegion ? row.role : undefined}
            data-region-match={isMultiRegion ? row.match : undefined}
          >
            <span
              class="inline-flex items-center gap-1 rounded-l-full bg-surface-primary px-1.5 py-1 text-secondary"
              class:rounded-r-full={!detail}
            >
              {#if RowIcon}
                <RowIcon width={14} height={14} />
              {/if}
              {rowShortLabel ?? ''}
              {#if isMultiRegion}
                {#if rowShortLabel}
                  <span aria-hidden="true">·</span>
                {/if}
                {roleLabel(row.role)}
              {/if}
            </span>
            {#if detail}
              <span
                class="inline-flex items-center gap-1 rounded-r-full px-1.5 py-1"
              >
                {detail}
                {#if row.label && state && !uncovered}
                  <span class="sr-only">({connectionStateLabel(state)})</span>
                {/if}
              </span>
            {/if}
          </span>
        </Tooltip>
      {/if}
    {/each}
  </div>
{/if}
