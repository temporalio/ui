<script lang="ts">
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

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
    // {
    //   id: 'task-failures',
    //   name: 'Task Failures',
    //   query: 'ExecutionStatus = "Running"',
    //   icon: 'error',
    //   count: 8,
    //   class: 'text-red-700 dark:text-red-300',
    // },
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

  const query = $derived(page.url.searchParams.get('query') || '');
  const savedQuery = page.url.searchParams.get('savedQuery');
  const namespace = $derived(page.params.namespace);

  const namespaceSavedQueries = $derived($savedQueries[namespace] || []);
  const systemQuery = $derived(
    query && systemViews.find((q) => q.query === query),
  );
  const unsavedQuery = $derived(
    query &&
      !namespaceSavedQueries.find((q) => q.query === query) &&
      !systemQuery,
  );

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
</script>

<div
  class="surface-primary max-h-[82vh] w-[60px] min-w-[60px] max-w-[60px] overflow-auto rounded-l-sm border border-r-0 border-subtle shadow-sm lg:w-[240px] lg:min-w-[240px] lg:max-w-[240px]"
>
  <div
    class="flex items-center justify-center gap-2 border-b border-subtle px-2 py-[.35rem] text-center lg:justify-start lg:py-[.47rem]"
  >
    <p class="text-xs font-medium leading-3 lg:block lg:text-sm">Saved Views</p>
  </div>

  <div class="space-y-2 p-2">
    <div class="border-b border-subtle pb-2 text-center">
      <div class="space-y-1">
        {#each systemViews as view}
          {@render queryButton(view)}
        {/each}
      </div>
    </div>

    {#if namespaceSavedQueries.length > 0}
      <div class="text-center">
        <div class="space-y-1">
          {#each namespaceSavedQueries as savedQuery}
            {@render queryButton(savedQuery)}
          {/each}
        </div>
      </div>
    {/if}

    {#if unsavedQuery && !systemQuery}
      <div class="space-y-1">
        {@render queryButton({
          id: 'unsaved',
          name: 'New View',
          query,
          icon: 'bookmark',
          badge: 'Unsaved',
        })}
      </div>
    {/if}

    {#if namespaceSavedQueries.length === 0 && !unsavedQuery}
      <div class="space-y-1">
        {@render queryButton({
          id: 'no-views',
          name: 'No views',
          query,
          icon: 'bookmark',
          badge: 'Add Filter',
          disabled: true,
        })}
      </div>
    {/if}
  </div>
</div>

{#snippet queryButton(savedQuery: SavedQuery)}
  <Button
    variant="primary"
    data-testid={savedQuery.id}
    on:click={() => setTab(savedQuery.query)}
    class="w-full"
    active={savedQuery.query === query && !savedQuery.disabled}
    disabled={savedQuery.disabled}
    size="sm"
  >
    <Icon
      name={savedQuery?.icon || 'bookmark'}
      class={merge(
        'h-4 w-4 flex-shrink-0 transition-colors duration-200 lg:hidden',
      )}
    />
    <span class="hidden truncate text-left text-sm font-normal lg:inline-block"
      >{savedQuery.name}</span
    >
    <span
      class:invisible={!savedQuery?.badge}
      class="surface-information right-2 top-2 hidden rounded-sm px-2 py-0.5 text-xs font-medium italic text-primary lg:static lg:ml-auto lg:block"
      >{savedQuery?.badge || ''}</span
    >
    {#if savedQuery.count !== undefined}
      <span
        class="hidden rounded-full bg-red-100 px-2 py-0.5 font-mono text-xs font-medium text-red-900 lg:inline-block dark:bg-slate-700 dark:text-slate-300"
        >{savedQuery.count}</span
      >
    {/if}
  </Button>
{/snippet}
