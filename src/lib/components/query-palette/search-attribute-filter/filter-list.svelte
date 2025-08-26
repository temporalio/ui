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

  let {
    editable = true,
    showQueryCommand,
    // onFilterClick,
  }: {
    editable: boolean;
    showQueryCommand: () => void;
    // onFilterClick?: (filter: SearchAttributeFilter) => void;
  } = $props();

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

{#snippet conditional(workflowFilter)}
  {@const { conditional, customDate } = workflowFilter}
  {#if isNullConditional(conditional)}
    {conditional}
  {:else if isDateTimeFilter(workflowFilter)}
    {#if !customDate}
      {getDateTimeConditonal(conditional)}
    {/if}
  {:else}
    {isStartsWith(conditional)
      ? translate('common.starts-with').toLocaleLowerCase()
      : conditional}
  {/if}
{/snippet}

{#snippet filterValue(workflowFilter)}
  {@const { value, conditional, customDate } = workflowFilter}
  {#if isNullConditional(conditional)}
    {String(value)}
  {:else if isDateTimeFilter(workflowFilter)}
    {#if customDate}
      {formatDateTimeRange(value, $timeFormat, $relativeTime)}
    {:else}
      {formatDate(value, $timeFormat, {
        relative: $relativeTime,
        abbrFormat: true,
      })}
    {/if}
  {:else}
    {isTextFilter(workflowFilter) ? `"${value}"` : value}
  {/if}
{/snippet}

<div class="flex flex-wrap items-center gap-1">
  {#if !editable}
    <button
      onclick={showQueryCommand}
      class={merge(
        'query-generator',
        'px-2 py-1',
        'inline-flex max-w-full items-center overflow-hidden rounded',
        'bg-green-200 text-green-900 hover:bg-green-400',
      )}
    >
      <div
        class={merge(
          'flex min-w-0 flex-shrink items-center px-1 text-xs leading-4',
        )}
      >
        <Icon name="search" />
        <span
          class={merge(
            'slide-in-left min-w-0 hyphens-auto break-words font-medium',
          )}
        >
          Query Generator
        </span>
      </div>
    </button>
  {/if}
  {#if editable}
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
  {/if}
  {#each visibleFilters as workflowFilter, i (`${workflowFilter.attribute}-${i}`)}
    {@const { attribute } = workflowFilter}
    {#if attribute}
      <div
        class="inline-flex h-full max-w-full flex-wrap"
        role="img"
        data-testid="{workflowFilter.attribute}-{i}"
        aria-label={workflowFilter.attribute}
      >
        <div
          class={merge(
            'inline-flex min-w-0 max-w-full items-center overflow-hidden rounded',
            'bg-blue-100 text-slate-900',
            'dark:bg-indigo-900 dark:text-white',
          )}
        >
          <div
            class={merge(
              'flex min-w-0 flex-shrink items-center gap-1 px-1 pr-1 text-xs leading-4',
            )}
          >
            <span class={merge('min-w-0 hyphens-auto break-words font-medium')}
              >{attribute}</span
            >
          </div>
          <div
            class={merge(
              'rounded',
              'flex min-w-0 flex-shrink items-start px-1 py-[.125rem] text-xs leading-[.95rem]',
              'bg-blue-500 text-white',
              'text-white dark:bg-indigo-500',
            )}
          >
            <span class={merge('min-w-0 hyphens-auto break-words font-normal')}
              >{@render conditional(workflowFilter)}</span
            >
          </div>
          <div
            class={merge(
              'rounded',
              'flex min-w-0 flex-shrink items-start px-1 py-[.125rem] text-xs leading-[.95rem]',
              'text-primary',
            )}
          >
            <span class={merge('min-w-0 hyphens-auto break-words font-normal')}
              >{@render filterValue(workflowFilter)}</span
            >
          </div>
          {#if editable}
            <button
              onclick={() => removeFilter(workflowFilter)}
              class={merge(
                'm-0.5 rounded',
                'flex min-w-0 flex-shrink items-start px-1 py-[.125rem] text-xs',
                'text-primary',
                'hover:bg-subtle',
              )}
            >
              <Icon name="close" />
            </button>
          {/if}
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

<style>
  .query-generator:hover .slide-in-left {
    max-width: 200px; /* adjust to your text length */
    transform: translateX(5px);
  }

  .slide-in-left {
    max-width: 0;
    overflow: hidden;
    transform: translateX(-2px);
    transition:
      max-width 0.5s ease-out,
      transform 0.5s ease-out;
    white-space: nowrap;
  }
</style>
