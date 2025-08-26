<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatusFilters } from '$lib/models/workflow-status';
  import { isStatusFilter } from '$lib/utilities/query/search-attribute-filter';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  export let filters: SearchAttributeFilter[];

  const { filter } = getContext<FilterContext>(FILTER_CONTEXT);
  $: _filters = [...filters];
  $: statusFilters = _filters.filter((filter) => isStatusFilter(filter));

  function apply() {
    filters = _filters;
    updateQueryParamsFromFilter($page.url, filters);
  }

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
      _filters = filters.filter((f) => f.attribute !== 'ExecutionStatus');
    } else if (statusFilters.find((s) => s.value === status)) {
      const nonStatusFilters = filters.filter((f) => !isStatusFilter(f));
      _filters = [
        ...nonStatusFilters,
        ...mapStatusesToFilters(
          statusFilters.filter((s) => s.value !== status),
        ),
      ];
    } else {
      if (!statusFilters.length) {
        _filters = [..._filters, mapStatusToFilter(status)];
      } else {
        const nonStatusFilters = _filters.filter((f) => !isStatusFilter(f));
        _filters = [
          ...nonStatusFilters,
          ...mapStatusesToFilters([
            ...statusFilters,
            mapStatusToFilter(status),
          ]),
        ];
      }
    }
    apply();
  };
</script>

<div class="flex flex-wrap items-center justify-center gap-2">
  {#each workflowStatusFilters as status (status)}
    {@const active =
      statusFilters.some((filter) => filter.value === status) ||
      (!statusFilters.length && status === 'All')}
    <Button
      variant={active ? 'primary' : 'secondary'}
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
