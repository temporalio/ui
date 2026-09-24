<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { shortRegion } from '$lib/utilities/compute-regions';

  import type { ComputeRegion } from './multi-region';

  interface Props {
    namespace: string;
    regions: readonly ComputeRegion[];
  }

  let { namespace, regions }: Props = $props();

  const multiRegion = $derived(regions.length > 1);

  const shortNamespace = $derived(namespace.replace(/\.[a-z0-9]{5}$/i, ''));
</script>

<h2 class="text-base font-medium">
  {multiRegion
    ? translate('workers.regions-section')
    : translate('workers.region-section')}
</h2>
<p class="mb-4 text-sm text-secondary">
  {#if shortNamespace}
    <span class="font-medium text-primary">{shortNamespace}</span>
  {/if}
  {#if multiRegion}
    {translate('workers.regions-section-description')}
  {:else}
    {translate('workers.region-section-description')}
    <span class="font-medium text-primary">{shortRegion(regions[0].id)}</span>.
  {/if}
</p>
