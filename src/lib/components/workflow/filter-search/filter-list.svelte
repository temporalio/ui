<script lang="ts">
  import { parseJSON } from 'date-fns';
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import { page } from '$app/stores';
  import { labsMode } from '$lib/stores/labs-mode';
  import {
    type TimeFormat,
    relativeTime,
    timeFormat,
  } from '$lib/stores/time-format';
  import { workflowFilters } from '$lib/stores/filters';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { formatDate, isValidDate } from '$lib/utilities/format-date';
  import {
    isDateTimeFilter,
    isTextFilter,
  } from '$lib/utilities/query/filter-search';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { isWorkflowStatusType } from '$lib/models/workflow-status';
  import { translate } from '$lib/i18n/translate';

  import Button from '$lib/holocene/button.svelte';
  import Chip from '$lib/holocene/chip.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  type T = $$Generic;

  const { filter, activeQueryIndex } =
    getContext<FilterContext<T>>(FILTER_CONTEXT);

  const removeQuery = (index: number) => {
    $workflowFilters.splice(index, 1);
    $workflowFilters = $workflowFilters;
    updateQueryParamsFromFilter($page.url, $workflowFilters, labsMode);

    if (index === $workflowFilters.length) {
      const previousQuery = $workflowFilters[$workflowFilters.length - 1];
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

  $: visibleFilters = $workflowFilters.slice(0, totalFiltersInView);
  $: hasMoreFilters = totalFiltersInView < $workflowFilters.length;

  const viewMoreFilters = () => {
    if (hasMoreFilters) {
      totalFiltersInView += 5;
    }
  };

  const getDateTimeConditonal = (conditional: string) => {
    if (['<', '<='].includes(conditional))
      return translate('before').toLowerCase();
    if (['>', '>='].includes(conditional))
      return translate('after').toLowerCase();
    return conditional;
  };

  const formatDateTimeRange = (
    value: string,
    format: TimeFormat,
    relative: boolean,
  ) => {
    const [conditon, start, operator, end] = value.split(' ');
    return `${conditon.toLowerCase()} ${formatDate(start, format, {
      relative,
      abbrFormat: true,
    })} ${operator.toLowerCase()} ${formatDate(end, format, {
      relative,
      abbrFormat: true,
    })}`;
  };
</script>

<div class="flex flex-wrap gap-2" class:pt-2={visibleFilters.length}>
  {#each visibleFilters as workflowFilter, i (`${workflowFilter.attribute}-${i}`)}
    {@const { attribute, value, conditional, customDate } = workflowFilter}
    {#if attribute}
      <div in:fade>
        <Chip
          removeButtonLabel={translate('workflows', 'remove-filter-label', {
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
              <span class="ml-1 -py-1">
                <WorkflowStatus status={value} />
              </span>
            </span>
          {:else}
            <span class="max-w-xs md:max-w-lg xl:max-w-2xl truncate">
              {attribute}
              {#if isDateTimeFilter(attribute)}
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
                {conditional}
                {isTextFilter(attribute) ? `"${value}"` : value}
              {/if}
            </span>
          {/if}
        </Chip>
      </div>
    {/if}
  {/each}
  {#if hasMoreFilters}
    <Button variant="search" thin on:click={viewMoreFilters}
      >View More...</Button
    >
  {/if}
</div>
