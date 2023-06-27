<script lang="ts">
  import { fade } from 'svelte/transition';
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import { page } from '$app/stores';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import Chip from '$lib/holocene/chip.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  type T = $$Generic;

  const { filter, activeQueryIndex } =
    getContext<FilterContext<T>>(FILTER_CONTEXT);

  const removeQuery = (index: number) => {
    $workflowFilters.splice(index, 1);
    $workflowFilters = $workflowFilters;
    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);

    if (index === $activeQueryIndex) {
      $activeQueryIndex = null;
      $filter = emptyFilter();
    } else if (index < $activeQueryIndex) {
      $activeQueryIndex -= 1;
    }
  };
</script>

<div class="flex flex-wrap gap-2 pt-2">
  {#each $workflowFilters as workflowFilter, i (`${workflowFilter.attribute}-${i}`)}
    {@const { attribute, value, conditional, customDate } = workflowFilter}
    {#if attribute}
      <div in:fade>
        <Chip
          on:remove={() => removeQuery(i)}
          on:click={() => {
            $activeQueryIndex = i;
            $filter = workflowFilter;
          }}
          intent="default"
          button
        >
          {attribute}
          {#if !customDate}
            {conditional}
          {/if}
          {#if attribute === 'ExecutionStatus'}
            <div class="-py-1">
              <WorkflowStatus status={value} />
            </div>
          {:else}
            {value}
          {/if}
        </Chip>
      </div>
    {/if}
  {/each}
</div>
