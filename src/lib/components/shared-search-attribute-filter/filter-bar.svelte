<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';

  import type { StatusAttribute } from './types.ts';

  import Filter from './filter.svelte';
  import ManualQuery from './manual-query.svelte';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    options: SearchAttributeOption[];
    id: string;
    statusAttribute?: StatusAttribute;
    onManualSearch?: (query: string) => void;
  }

  let { filters, options, id, statusAttribute, onManualSearch }: Props =
    $props();

  let viewManualQuery = $state(false);
</script>

<div>
  <div
    class="flex w-full flex-wrap items-center justify-between gap-2 border border-subtle bg-primary p-1.5"
  >
    <div class="flex grow items-center justify-start gap-4 px-2">
      <Icon name="filter-lines" class="text-primary-text h-4 w-4 shrink-0" />
      <Filter {filters} {options} {id} {statusAttribute} />
    </div>
    <div class="flex items-center gap-1">
      <Tooltip
        text={viewManualQuery ? 'Hide raw query' : 'View raw query'}
        left
      >
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
  </div>
  {#if viewManualQuery}
    <ManualQuery {filters} {id} onSearch={onManualSearch} />
  {/if}
</div>
