<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let {
    onDoubleClick,
    showQueryCommand,
  }: {
    onDoubleClick: (query: SavedQuery) => void;
    showQueryCommand?: () => void;
  } = $props();
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

<div
  class="max-h-[82vh] w-[80px] min-w-[80px] max-w-[80px] overflow-auto rounded-l-sm border border-r-0 border-subtle bg-secondary shadow-sm lg:w-[240px] lg:min-w-[240px] lg:max-w-[240px]"
>
  <!-- Header -->
  <div class="border-b border-subtle px-2 py-2">
    <div class="flex items-center justify-center gap-2 lg:justify-start">
      <Icon
        name="bookmark"
        class="h-5 w-5 text-yellow-600 dark:text-yellow-400"
      />
      <p
        class="hidden text-sm font-medium text-slate-500 lg:block dark:text-slate-400"
      >
        Saved Queries
      </p>
    </div>
  </div>

  <div class="p-2">
    <div class="mb-3">
      <div class="mb-2 px-2 py-1">
        <span
          class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >Quick Filters</span
        >
      </div>

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
            name="search"
            class={merge(
              'h-4 w-4 font-medium transition-colors duration-200',
              query === ''
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
            )}
          />
          <span class="hidden lg:inline">All Workflows</span>
        </button>

        <!-- Today -->
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

        <!-- Last Hour -->
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

        <!-- Child Workflows -->
        <button
          data-testid="child-workflows"
          class={merge(
            'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-sm transition-all duration-200 lg:justify-start',
            'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            'hover:shadow-sm active:scale-[0.98]',
            query === 'ParentWorkflowId is not null' &&
              'border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
          )}
          onclick={() => setTab('ParentWorkflowId is not null')}
        >
          <Icon
            name="workflow"
            class={merge(
              'h-4 w-4 font-medium transition-colors duration-200',
              query === 'ParentWorkflowId is not null'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
            )}
          />
          <span class="hidden lg:inline">Child Workflows</span>
        </button>
      </div>
    </div>

    {#if $savedQueries.length > 0}
      <div class="border-t border-subtle pt-3">
        <div class="mb-2 px-1 py-1 lg:px-2">
          <span
            class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >Custom Queries</span
          >
        </div>

        <div class="space-y-1">
          <button
            data-testid="builder"
            class={merge(
              'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-xs transition-all duration-200 lg:justify-start lg:text-sm',
              'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              'hover:shadow-sm active:scale-[0.98]',
            )}
            onclick={showQueryCommand}
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
          {#each $savedQueries as savedQuery}
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
              ondblclick={() => onDoubleClick(savedQuery)}
            >
              <Icon
                name="bookmark"
                class={merge(
                  'h-4 w-4 flex-shrink-0 transition-colors duration-200',
                  query === savedQuery.query
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200',
                )}
              />
              <span
                class="hidden truncate text-left font-medium lg:inline-block"
                >{savedQuery.name}</span
              >
              <div
                class="ml-auto hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:inline-block"
              >
                <Icon
                  name="pencil"
                  class="h-3 w-3 text-slate-400 dark:text-slate-500"
                />
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if $savedQueries.length === 0}
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
              'group flex w-full items-center justify-center gap-3 rounded-sm border border-transparent px-2 py-1 text-xs transition-all duration-200 lg:text-sm',
              'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              'hover:shadow-sm active:scale-[0.98]',
            )}
            onclick={showQueryCommand}
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
