<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';
  import { workflowFilters } from '$lib/stores/filters';
  import { isStatusFilter } from '$lib/utilities/query/search-attribute-filter';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  const { filter } = getContext<FilterContext>(FILTER_CONTEXT);

  const statusFilters = $derived(
    [...$workflowFilters].filter((filter) => isStatusFilter(filter)),
  );

  function mapStatusToFilter(value: string) {
    return {
      ...$filter,
      value,
    };
  }

  function mapStatusesToFilters(_filters: SearchAttributeFilter[]) {
    if (_filters.length === 1) {
      return [mapStatusToFilter(_filters[0].value)];
    } else {
      return _filters.map((filter, i) => {
        const operator = i === _filters.length - 1 ? '' : 'OR';
        return {
          ...filter,
          operator,
        };
      });
    }
  }

  const onStatusClick = (status: string) => {
    if (status === 'All') {
      $workflowFilters = $workflowFilters.filter(
        (f) => f.attribute !== 'ExecutionStatus',
      );
    } else if (statusFilters.find((s) => s.value === status)) {
      const nonStatusFilters = $workflowFilters.filter(
        (f) => !isStatusFilter(f),
      );
      $workflowFilters = [
        ...nonStatusFilters,
        ...mapStatusesToFilters(
          statusFilters.filter((s) => s.value !== status),
        ),
      ];
    } else {
      if (!statusFilters.length) {
        $workflowFilters = [...$workflowFilters, mapStatusToFilter(status)];
      } else {
        const nonStatusFilters = $workflowFilters.filter(
          (f) => !isStatusFilter(f),
        );
        $workflowFilters = [
          ...nonStatusFilters,
          ...mapStatusesToFilters([
            ...statusFilters,
            mapStatusToFilter(status),
          ]),
        ];
      }
    }

    updateQueryParamsFromFilter(page.url, $workflowFilters);
  };
</script>

<div class="flex flex-wrap items-center justify-center gap-2 lg:flex-col">
  {#each workflowStatusFilters as status (status)}
    {@const active =
      statusFilters.some((filter) => filter.value === status) ||
      (!statusFilters.length && status === 'All')}
    <Button
      variant={active ? 'primary' : 'secondary'}
      class="w-96"
      data-testid={status}
      on:click={() => {
        onStatusClick(status);
      }}
    >
      {#if status === 'All'}
        <Translate key="workflows.all-statuses" />
      {:else}
        <WorkflowStatus {status} />
      {/if}
    </Button>
  {/each}
</div>
