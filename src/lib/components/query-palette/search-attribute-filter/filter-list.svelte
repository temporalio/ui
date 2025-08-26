<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { isNullConditional, isStartsWith } from '$lib/utilities/is';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    formatDateTimeRange,
    isDateTimeFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let totalFiltersInView = $state(20);
  let viewRawQuery = $state(false);

  let query = $derived(page.url.searchParams.get('query') || '');
  const visibleFilters = $derived(
    $workflowFilters.slice(0, totalFiltersInView),
  );
  const hasMoreFilters = $derived(totalFiltersInView < $workflowFilters.length);

  const viewMoreFilters = () => {
    if (hasMoreFilters) {
      totalFiltersInView += 5;
    }
  };

  const getDateTimeConditonal = (conditional: string) => {
    if (['<', '<='].includes(conditional))
      return translate('common.before').toLowerCase();
    if (['>', '>='].includes(conditional))
      return translate('common.after').toLowerCase();
    return conditional;
  };

  const clearFilters = () => {
    $workflowFilters = [];
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: '',
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };

  const removeFilter = (filter: SearchAttributeFilter) => {
    $workflowFilters = $workflowFilters.filter((f) => f !== filter);
    const searchQuery = toListWorkflowQueryFromFilters(
      combineFilters($workflowFilters),
    );
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: searchQuery,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };
</script>

{#snippet filterValue(workflowFilter)}
  {@const { value, conditional, customDate } = workflowFilter}
  {#if isNullConditional(conditional)}
    {conditional}
    {String(value)}
  {:else if isDateTimeFilter(workflowFilter)}
    {#if customDate}
      {formatDateTimeRange(value, $timeFormat, $relativeTime)}
    {:else}
      {getDateTimeConditonal(conditional)}
      {formatDate(value, $timeFormat, {
        relative: $relativeTime,
        abbrFormat: true,
      })}
    {/if}
  {:else}
    {isStartsWith(conditional)
      ? translate('common.starts-with').toLocaleLowerCase()
      : conditional}
    {isTextFilter(workflowFilter) ? `"${value}"` : value}
  {/if}
{/snippet}

<div class="flex flex-wrap gap-2">
  <Button
    variant="secondary"
    size="xs"
    leadingIcon={viewRawQuery ? 'eye-hide' : 'json'}
    on:click={() => (viewRawQuery = !viewRawQuery)}
  />
  <Button
    variant="secondary"
    size="xs"
    on:click={clearFilters}
    disabled={!$workflowFilters.length}>Clear All</Button
  >
  {#each visibleFilters as workflowFilter, i (`${workflowFilter.attribute}-${i}`)}
    {@const { attribute } = workflowFilter}
    {#if attribute}
      <div
        class="inline-flex max-w-full flex-wrap"
        role="img"
        data-testid="{workflowFilter.attribute}-{i}"
        aria-label={workflowFilter.attribute}
      >
        <div
          class={merge(
            'm1',
            'inline-flex min-w-0 max-w-full items-center overflow-hidden rounded',
            'bg-blue-200 text-slate-900',
            'dark:bg-indigo-700 dark:text-white',
          )}
        >
          <div
            class={merge(
              'flex min-w-0 flex-shrink items-center gap-1 px-2 pr-1 text-xs leading-4',
            )}
          >
            <span class={merge('min-w-0 hyphens-auto break-words font-medium')}
              >{attribute}</span
            >
          </div>
          <div
            class={merge(
              'm-1 rounded',
              'flex min-w-0 flex-shrink items-start px-2 py-[.125rem] text-xs leading-[.95rem]',
              'bg-blue-300 text-slate-900',
              'dark:bg-indigo-800 dark:text-white',
            )}
          >
            <span class={merge('min-w-0 hyphens-auto break-words font-normal')}
              >{@render filterValue(workflowFilter)}</span
            >
          </div>
          <button
            onclick={() => removeFilter(workflowFilter)}
            class={merge(
              'm-0.5 rounded',
              'flex min-w-0 flex-shrink items-start px-1 py-[.125rem] text-xs',
              'text-slate-900 dark:text-white',
              'hover:bg-subtle',
            )}
          >
            <Icon name="close" />
          </button>
        </div>
      </div>
    {/if}
  {/each}
  {#if hasMoreFilters}
    <Button variant="secondary" size="xs" on:click={viewMoreFilters}
      >{translate('common.view-more')}</Button
    >
  {/if}
</div>
{#if viewRawQuery}
  <CodeBlock editable content={query} />
{/if}
