<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import ActivityFilter from './filter.svelte';
  import ActivityManualQuery from './manual-query.svelte';

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

<div>
  <div
    class="flex w-full flex-wrap items-center justify-between gap-2 border border-subtle bg-primary p-1.5"
  >
    <div class="flex grow items-center justify-start gap-4 px-2">
      <Icon name="filter-lines" class="text-primary-text h-4 w-4 shrink-0" />
      <ActivityFilter />
    </div>
    {@render actionToggleButtons()}
  </div>
  {#if viewManualQuery}
    <ActivityManualQuery />
  {/if}
</div>
