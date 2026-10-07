<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import type { ComputeConfig } from '$lib/types/deployments';
  import {
    computeProviderShortLabel,
    isMultiRegion,
    type NamespaceRegion,
    resolveRegionCoverage,
    shortRegion,
  } from '$lib/utilities/compute-regions';

  /**
   * Where a Version's workers run, for a Namespace held in more than one region.
   *
   * Renders nothing for a single-region Namespace, which is the only shape a
   * consumer that knows nothing about regions can produce — so this stays dark
   * until one opts in by passing them.
   */
  interface Props {
    computeConfig: ComputeConfig | undefined;
    namespaceRegions?: readonly NamespaceRegion[];
  }

  let { computeConfig, namespaceRegions = [] }: Props = $props();

  const coverage = $derived(
    isMultiRegion(namespaceRegions)
      ? resolveRegionCoverage(computeConfig, namespaceRegions)
      : [],
  );

  /**
   * What serves a region: the providers of its groups, or why there is nothing.
   * A catch-all is named as such rather than shown as if it were configured for
   * this region, because the distinction is what tells someone whether a
   * failover here was planned for.
   */
  const describe = (entry: (typeof coverage)[number]): string => {
    if (entry.match === 'none') return translate('workers.region-uncovered');

    const providers = [
      ...new Set(
        entry.groups
          .map(({ providerType }) => computeProviderShortLabel(providerType))
          .filter(Boolean),
      ),
    ].join(', ');

    if (entry.match === 'catch-all') {
      return providers
        ? `${providers} (${translate('workers.region-covered-by-default')})`
        : translate('workers.region-covered-by-default');
    }
    return providers;
  };
</script>

{#if coverage.length}
  <ul class="flex flex-col gap-2">
    {#each coverage as entry (entry.regionId)}
      <li class="flex items-center gap-2 text-xs">
        <Badge
          size="sm"
          colorScheme={entry.role === 'primary' ? 'accent' : 'neutral'}
          text={entry.role === 'primary'
            ? translate('workers.region-role-primary')
            : translate('workers.region-role-replica')}
          data-region-role={entry.role}
        />
        <code class="text-primary" data-testid="region-id"
          >{shortRegion(entry.regionId)}</code
        >
        <span
          class={entry.match === 'none' ? 'text-danger' : 'text-secondary'}
          data-region-match={entry.match}
          title={entry.match === 'none'
            ? translate('workers.region-uncovered-help')
            : undefined}
        >
          {describe(entry)}
        </span>
      </li>
    {/each}
  </ul>
{/if}
