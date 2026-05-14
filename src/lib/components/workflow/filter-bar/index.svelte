<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import Filter from './filter.svelte';
  import ManualQuery from './manual-query.svelte';

  let viewManualQuery = $state(false);
</script>

{#snippet actionToggleButtons()}
  <div class="flex items-center gap-1">
    <Tooltip text={viewManualQuery ? 'Hide raw query' : 'View raw query'} left>
      <Button
        variant="ghost"
        size="xs"
        leadingIcon="json"
        active={viewManualQuery}
        data-testid="toggle-manual-query"
        on:click={() => (viewManualQuery = !viewManualQuery)}
      />
    </Tooltip>
  </div>
{/snippet}

<div class="py-1">
  <div class="flex w-full flex-wrap items-center justify-between gap-2">
    <div class="flex grow items-center justify-start gap-4">
      <Filter />
    </div>
    {@render actionToggleButtons()}
  </div>
  {#if viewManualQuery}
    <ManualQuery />
  {/if}
</div>
