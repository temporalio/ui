<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { IconCode } from '$lib/io/icon';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import type { SearchAttributes } from '$lib/types/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  import type { StatusAttribute } from './types.ts';

  import Filter from './filter.svelte';
  import ManualQuery from './manual-query.svelte';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    options: SearchAttributeOption[];
    searchAttributes: SearchAttributes;
    id: string;
    statusAttribute?: StatusAttribute;
    onManualSearch?: (query: string) => void;
    includeNullConditions?: boolean;
  }

  let {
    filters,
    options,
    searchAttributes,
    id,
    statusAttribute = 'ExecutionStatus',
    onManualSearch,
    includeNullConditions,
  }: Props = $props();

  let viewManualQuery = $state(false);

  // Back/forward changes the query param without going through the interactive
  // add/remove/edit path, so the pills have to be re-derived from the URL.
  afterNavigate(({ type }) => {
    if (type !== 'popstate') {
      return;
    }

    const query = page.url.searchParams.get('query') ?? '';
    filters.set(query ? toListWorkflowFilters(query, searchAttributes) : []);
  });
</script>

<div>
  <div
    class="flex w-full flex-wrap items-center justify-between gap-2 border border-b-0 border-subtle bg-primary p-1.5"
  >
    <Filter
      {filters}
      {options}
      {id}
      {statusAttribute}
      {includeNullConditions}
    />
    <div class="flex items-center gap-1">
      <Tooltip
        text={viewManualQuery ? 'Hide raw query' : 'View raw query'}
        left
      >
        <Button
          variant="ghost"
          size="xs"
          LeadingIcon={IconCode}
          active={viewManualQuery}
          data-testid="toggle-manual-query"
          onclick={() => (viewManualQuery = !viewManualQuery)}
        />
      </Tooltip>
    </div>
  </div>
  {#if viewManualQuery}
    <ManualQuery {filters} {searchAttributes} {id} onSearch={onManualSearch} />
  {/if}
</div>
