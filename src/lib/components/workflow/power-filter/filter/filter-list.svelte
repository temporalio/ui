<script lang="ts">
  import { fade } from 'svelte/transition';

  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Chip from '$lib/holocene/chip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { isWorkflowStatusType } from '$lib/models/workflow-status';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { isNullConditional, isStartsWith } from '$lib/utilities/is';
  import {
    formatDateTimeRange,
    isDateTimeFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  export let filters: SearchAttributeFilter[];

  const { filter, activeQueryIndex } =
    getContext<FilterContext>(FILTER_CONTEXT);

  const removeQuery = (index: number) => {
    filters.splice(index, 1);
    filters = filters;
    updateQueryParamsFromFilter($page.url, filters);

    if (index === filters.length) {
      const previousQuery = filters[filters.length - 1];
      if (previousQuery) {
        previousQuery.operator = '';
      }
    }

    if (index === $activeQueryIndex) {
      $activeQueryIndex = null;
      $filter = emptyFilter();
    } else if (index < $activeQueryIndex) {
      $activeQueryIndex -= 1;
    }
  };

  let totalFiltersInView = 5;

  $: visibleFilters = filters.slice(0, totalFiltersInView);
  $: hasMoreFilters = totalFiltersInView < filters.length;

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
</script>

<div class="flex flex-wrap gap-2">
  {#each visibleFilters as workflowFilter, i (`${workflowFilter.attribute}-${i}`)}
    {@const { attribute, value, conditional, customDate } = workflowFilter}
    {#if attribute}
      <div in:fade data-testid="{workflowFilter.attribute}-{i}">
        <Chip
          removeButtonLabel={translate('workflows.remove-filter-label', {
            attribute,
          })}
          on:remove={() => removeQuery(i)}
          on:click={() => {
            $activeQueryIndex = i;
            $filter = { ...workflowFilter };
          }}
          intent="default"
          button
        >
          {#if attribute === 'ExecutionStatus' && isWorkflowStatusType(value)}
            <span class="flex">
              {attribute}
              {conditional}
              <span class="-py-1 ml-1">
                <WorkflowStatus status={value} />
              </span>
            </span>
          {:else}
            <span class="max-w-xs truncate md:max-w-lg xl:max-w-2xl">
              {attribute}
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
            </span>
          {/if}
        </Chip>
      </div>
    {/if}
  {/each}
  {#if hasMoreFilters}
    <Button variant="secondary" size="xs" on:click={viewMoreFilters}
      >{translate('common.view-more')}</Button
    >
  {/if}
</div>
