<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import type { ComputeConfig } from '$lib/types/deployments';
  import {
    isMultiRegion,
    type NamespaceRegion,
    resolveRegionCoverage,
    shortRegion,
  } from '$lib/utilities/compute-regions';

  /**
   * The regions a Version's compute covers, small enough to sit in a table row.
   *
   * Renders nothing for a single-region Namespace, so a consumer that passes no
   * regions sees the row exactly as it is today.
   *
   * A region nothing serves is the one worth noticing in a list, so it is the
   * only one coloured. Showing every region in a warning colour would make the
   * ordinary case look alarming and the real case easy to miss.
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
</script>

{#each coverage as entry (entry.regionId)}
  <Badge
    size="sm"
    colorScheme={entry.match === 'none' ? 'danger' : 'neutral'}
    text={shortRegion(entry.regionId)}
    data-region-match={entry.match}
    title={entry.match === 'none'
      ? translate('workers.region-uncovered-help')
      : undefined}
  />
{/each}
