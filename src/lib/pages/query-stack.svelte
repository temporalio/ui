<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import QueryPalette from '$lib/components/query-palette/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const query = $derived(page.url.searchParams.get('query'));

  let viewCommandPalette = $state(false);
  let editingQuery: SavedQuery | undefined = $state(undefined);

  const setTab = (_query: string) => {
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: _query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
    if (_query) {
      $workflowFilters = toListWorkflowFilters(_query, $searchAttributes);
    }
  };

  const showCommandPalette = () => {
    viewCommandPalette = true;
  };

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const getLastHour = () => {
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    lastHour.setSeconds(0, 0);
    return lastHour.toISOString();
  };
</script>

<div class="w-36 min-w-36 max-w-36">
  <button
    data-testid="search"
    class={merge(
      'm-1.5 w-full rounded-l-sm',
      'flex flex-shrink items-start gap-1 px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
    )}
    onclick={() => showCommandPalette()}><Icon name="search" />Search</button
  >
  <button
    data-testid="all"
    class={merge(
      'm-1.5 w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === '' && 'bg-subtle',
    )}
    onclick={() => setTab('')}>All</button
  >
  <button
    data-testid="today"
    class={merge(
      'm-1.5 w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === `StartTime >= "${getToday()}"` && 'bg-subtle',
    )}
    onclick={() => setTab(`StartTime >= "${getToday()}"`)}
  >
    Today</button
  >
  <button
    data-testid="last-hour"
    class={merge(
      'm-1.5 w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === `StartTime >= "${getLastHour()}"` && 'bg-subtle',
    )}
    onclick={() => setTab(`StartTime >= "${getLastHour()}"`)}>Last Hour</button
  >
  {#each $savedQueries as savedQuery}
    <button
      data-testid={savedQuery.id}
      class={merge(
        'm-1.5 w-full rounded-l-sm',
        'flex  items-start px-1 py-1 text-xs',
        'text-slate-900 dark:text-white',
        query === savedQuery.query && 'bg-subtle',
      )}
      onclick={() => setTab(savedQuery.query)}
      ondblclick={() => {
        editingQuery = savedQuery;
        viewCommandPalette = true;
      }}
    >
      <p class="truncate text-xs">{savedQuery.name}</p>
    </button>
  {/each}
</div>
<QueryPalette bind:open={viewCommandPalette} bind:editingQuery />
