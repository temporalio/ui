<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let { onDoubleClick }: { onDoubleClick: (query: SavedQuery) => void } =
    $props();
  const query = $derived(page.url.searchParams.get('query') || '');

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

<div class="mt-1 w-[140px] min-w-[140px] max-w-[140px]">
  <p
    class={merge(
      'w-full',
      'flex items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      'border-b border-subtle',
    )}
  >
    Saved Queries
  </p>
  <button
    data-testid="all"
    class={merge(
      'w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === '' && 'bg-subtle dark:bg-interactive',
    )}
    onclick={() => setTab('')}>All</button
  >
  <button
    data-testid="today"
    class={merge(
      'w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === `StartTime >= "${getToday()}"` &&
        'bg-subtle dark:bg-interactive',
    )}
    onclick={() => setTab(`StartTime >= "${getToday()}"`)}
  >
    Today</button
  >
  <button
    data-testid="last-hour"
    class={merge(
      'w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === `StartTime >= "${getLastHour()}"` &&
        'bg-subtle dark:bg-interactive',
    )}
    onclick={() => setTab(`StartTime >= "${getLastHour()}"`)}>Last Hour</button
  >
  <button
    data-testid="last-hour"
    class={merge(
      'w-full rounded-l-sm',
      'flex  items-start px-1 py-1 text-xs',
      'text-slate-900 dark:text-white',
      query === 'ParentWorkflowId is not null' &&
        'bg-subtle dark:bg-interactive',
    )}
    onclick={() => setTab('ParentWorkflowId is not null')}
    >Child Workflows</button
  >
  {#each $savedQueries as savedQuery}
    <button
      data-testid={savedQuery.id}
      class={merge(
        'w-full rounded-l-sm',
        'flex  items-start px-1 py-1 text-xs',
        'text-slate-900 dark:text-white',
        query === savedQuery.query && 'bg-subtle dark:bg-interactive',
      )}
      onclick={() => setTab(savedQuery.query)}
      ondblclick={() => onDoubleClick(savedQuery)}
    >
      <p class="truncate text-xs">{savedQuery.name}</p>
    </button>
  {/each}
</div>
