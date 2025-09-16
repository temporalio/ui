<script lang="ts">
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const query = $derived(page.url.searchParams.get('query') || '');
  const savedQuery = page.url.searchParams.get('savedQuery');
  const namespace = $derived(page.params.namespace);

  const namespaceSavedQueries = $derived($savedQueries[namespace] || []);

  onMount(() => {
    if (savedQuery) {
      if (!$savedQueries[namespace]) $savedQueries[namespace] = [];

      $savedQueries[namespace] = [
        ...$savedQueries[namespace],
        {
          name: savedQuery,
          query,
          id: Date.now().toString(),
        },
      ];

      const url = new URL(page.url);
      url.searchParams.delete('savedQuery');
      goto(url);
    }
  });
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

  const systemViews: SavedQuery[] = [
    {
      id: 'all',
      name: 'All Workflows',
      query: '',
      icon: 'workflow',
    },
    {
      id: 'task-failures',
      name: 'Task Failures',
      query: 'ExecutionStatus = "Running"',
      icon: 'error',
      count: 8,
      class: 'text-red-700 dark:text-red-300',
    },
    {
      id: 'child-workflows',
      name: 'Parent Workflows',
      query: 'ParentWorkflowId is null',
      icon: 'relationship',
    },
    {
      id: 'today',
      name: 'Today',
      query: `StartTime >= "${getToday()}"`,
      icon: 'calendar',
    },
    {
      id: 'last-hour',
      name: 'Last Hour',
      query: `StartTime >= "${getLastHour()}"`,
      icon: 'clock',
    },
  ];
</script>

<div
  class="surface-primary max-h-[82vh] w-[60px] min-w-[60px] max-w-[60px] overflow-auto rounded-l-sm border border-r-0 border-subtle shadow-sm lg:w-[240px] lg:min-w-[240px] lg:max-w-[240px]"
>
  <div
    class="flex items-center justify-center gap-2 border-b border-subtle px-2 py-[.35rem] text-center text-slate-500 lg:justify-start lg:py-[.47rem] dark:text-slate-400"
  >
    <p class="text-xs font-medium leading-3 lg:block lg:text-sm">Saved Views</p>
  </div>

  <div class="p-2">
    <div class="mb-3 text-center">
      <div class="space-y-1">
        {#each systemViews as view}
          {@render queryButton(view)}
        {/each}
      </div>
    </div>

    {#if namespaceSavedQueries.length > 0}
      <div class="border-t border-subtle pt-3 text-center">
        <div class="space-y-1">
          {#each namespaceSavedQueries as savedQuery}
            {@render queryButton(savedQuery)}
          {/each}
        </div>
      </div>
    {/if}

    {#if namespaceSavedQueries.length === 0}
      <div class="border-t border-subtle pt-3">
        <div class="space-y-2 px-3 py-4 text-center">
          <Icon
            name="bookmark"
            class="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600"
          />
          <p class="text-sm text-slate-500 dark:text-slate-400">
            No custom queries yet
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

{#snippet queryButton(savedQuery: SavedQuery)}
  <button
    data-testid={savedQuery.id}
    class={merge(
      'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-xs transition-all duration-200 lg:justify-start lg:text-sm',
      'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      'hover:shadow-sm active:scale-[0.98]',
      query === savedQuery.query &&
        'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      savedQuery.class,
    )}
    onclick={() => setTab(savedQuery.query)}
  >
    <Icon
      name={savedQuery?.icon || 'bookmark'}
      class={merge(
        'h-4 w-4 flex-shrink-0 transition-colors duration-200 lg:hidden',
        query === savedQuery.query
          ? 'text-indigo-500 dark:text-indigo-400'
          : 'text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400',
      )}
    />
    <span class="hidden truncate text-left font-medium lg:inline-block"
      >{savedQuery.name}</span
    >
    {#if savedQuery.count !== undefined}
      <span
        class="hidden rounded-full bg-red-100 px-2 py-0.5 font-mono text-xs font-medium text-red-900 lg:inline-block dark:bg-slate-700 dark:text-slate-300"
        >{savedQuery.count}</span
      >
    {/if}
  </button>
{/snippet}
