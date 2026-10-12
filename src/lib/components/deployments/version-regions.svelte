<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconAwsColor, type IconComponent, IconGcpColor } from '$lib/io/icon';
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
  const cloudIcon = (providerType: string | undefined): IconComponent =>
    providerType === 'gcp-cloud-run' ? IconGcpColor : IconAwsColor;

  const providerType = $derived(
    groups.find((group) => group.providerType)?.providerType,
  );
  const providerShortLabel = $derived(computeProviderShortLabel(providerType));
  const ProviderIcon = $derived(cloudIcon(providerType));
  const providerLabel = $derived(
    computeProviderLabel(
      groups.find((group) => group.providerType)?.providerType,
    ),
  );

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
    return groups.map((group, index) => ({
      key: group.name,
      label: group.regionId,
      role: index === 0 ? 'primary' : 'replica',
      match: group.regionId ? 'region' : 'catch-all',
      providerType: group.providerType,
    }));
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
      {@const tooltip =
        row.match === 'none'
          ? translate('workers.region-not-configured-tooltip')
          : [
              providerLabel ?? '',
              state ? connectionStateLabel(state) : '',
              state ? connectionTooltip(computeStatus) : '',
            ]
              .filter(Boolean)
              .join(' · ')}
      {@const detail = row.label ?? (state ? connectionStateLabel(state) : '')}
      {#if detail || providerShortLabel}
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
              <ProviderIcon width={14} height={14} />
              {providerShortLabel}
              {#if isMultiRegion}
                <span aria-hidden="true">·</span>
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
