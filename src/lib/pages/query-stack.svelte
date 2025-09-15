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
</script>

<div
  class="surface-primary max-h-[82vh] w-[60px] min-w-[60px] max-w-[60px] overflow-auto rounded-l-sm border border-r-0 border-subtle shadow-sm lg:w-[240px] lg:min-w-[240px] lg:max-w-[240px]"
>
  <div class="border-b border-subtle px-2 py-[.47rem]">
    <div
      class="flex items-center justify-center gap-2 text-center text-slate-500 lg:justify-start dark:text-slate-400"
    >
      <p class="text-xs font-medium lg:block lg:text-sm">Saved Views</p>
    </div>
  </div>

  <div class="p-2">
    <div class="mb-3 text-center">
      <div class="space-y-1">
        <button
          data-testid="all"
          class={merge(
            'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-sm transition-all duration-200 lg:justify-start',
            'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            'hover:shadow-sm active:scale-[0.98]',
            query === '' &&
              'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
          )}
          onclick={() => setTab('')}
        >
          <Icon
            name="workflow"
            class={merge(
              'h-4 w-4 font-medium transition-colors duration-200',
              query === ''
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
            )}
          />
          <span class="hidden lg:inline">All Workflows</span>
        </button>
        <button
          data-testid="child-workflows"
          class={merge(
            'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-sm transition-all duration-200 lg:justify-start',
            'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            'hover:shadow-sm active:scale-[0.98]',
            query === 'ParentWorkflowId is null' &&
              'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
          )}
          onclick={() => setTab('ParentWorkflowId is null')}
        >
          <Icon
            name="relationship"
            class={merge(
              'h-4 w-4 font-medium transition-colors duration-200',
              query === 'ParentWorkflowId is not null'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
            )}
          />
          <span class="hidden lg:inline">Parent Workflows</span>
        </button>
        <button
          data-testid="today"
          class={merge(
            'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-sm transition-all duration-200 lg:justify-start',
            'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            'hover:shadow-sm active:scale-[0.98]',
            query === `StartTime >= "${getToday()}"` &&
              'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
          )}
          onclick={() => setTab(`StartTime >= "${getToday()}"`)}
        >
          <Icon
            name="calendar"
            class={merge(
              'h-4 w-4 font-medium transition-colors duration-200',
              query === `StartTime >= "${getToday()}"`
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
            )}
          />
          <span class="hidden lg:inline">Today</span>
        </button>
        <button
          data-testid="last-hour"
          class={merge(
            'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-sm transition-all duration-200 lg:justify-start',
            'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            'hover:shadow-sm active:scale-[0.98]',
            query === `StartTime >= "${getLastHour()}"` &&
              'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
          )}
          onclick={() => setTab(`StartTime >= "${getLastHour()}"`)}
        >
          <Icon
            name="clock"
            class={merge(
              'h-4 w-4 font-medium transition-colors duration-200',
              query === `StartTime >= "${getLastHour()}"`
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
            )}
          />
          <span class="hidden lg:inline">Last Hour</span>
        </button>
      </div>
    </div>

    {#if namespaceSavedQueries.length > 0}
      <div class="border-t border-subtle pt-3 text-center">
        <div class="space-y-1">
          {#each namespaceSavedQueries as savedQuery}
            {@render customQueryButton(savedQuery)}
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
          <button
            data-testid="builder"
            class={merge(
              'group flex w-full items-center justify-center gap-3 rounded-sm border border-subtle px-2 py-1 text-xs transition-all duration-200 lg:text-sm',
              'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              'hover:shadow-sm active:scale-[0.98]',
            )}
          >
            <Icon
              name="add"
              class={merge(
                'h-4 w-4 flex-shrink-0 transition-colors duration-200',
                'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
              )}
            />
            <span class="hidden truncate text-left font-medium lg:inline-block"
              >Open Builder</span
            >
          </button>
          <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Double-click a custom query to edit it in Builder
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

{#snippet customQueryButton(savedQuery: SavedQuery)}
  <button
    data-testid={savedQuery.id}
    class={merge(
      'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-xs transition-all duration-200 lg:justify-start lg:text-sm',
      'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      'hover:shadow-sm active:scale-[0.98]',
      query === savedQuery.query &&
        'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    )}
    onclick={() => setTab(savedQuery.query)}
  >
    <Icon
      name="bookmark"
      class={merge(
        'h-4 w-4 flex-shrink-0 transition-colors duration-200',
        query === savedQuery.query
          ? 'text-yellow-500 dark:text-yellow-400'
          : 'text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400',
      )}
    />
    <span class="hidden truncate text-left font-medium lg:inline-block"
      >{savedQuery.name}</span
    >
  </button>
{/snippet}
