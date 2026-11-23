<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  import type { ComputeRegion } from './multi-region';

  interface Props {
    /** Where the compute runs: the primary, then the replica if any. */
    regions: readonly ComputeRegion[];
  }

  let { regions }: Props = $props();

  const label = (region: ComputeRegion) => region.label ?? region.id;
  const [primary, replica] = $derived(regions);
</script>

<h2 class="text-base font-medium">
  {replica
    ? translate('workers.regions-section')
    : translate('workers.region-section')}
</h2>
<p class="mb-4 text-sm text-secondary">
  {#if primary && replica}
    {translate('workers.regions-run-in', { replica: label(replica) })}
  {:else}
    <!-- One region is an unscoped group: it runs wherever the Namespace is
    active, so the line names no region. -->
    {translate('workers.region-runs-anywhere')}
  {/if}
</p>
