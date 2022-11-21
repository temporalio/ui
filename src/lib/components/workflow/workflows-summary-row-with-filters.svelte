<script lang="ts">
  import { page } from '$app/stores';

  import { formatDate } from '$lib/utilities/format-date';
  import { getMilliseconds } from '$lib/utilities/format-time';
  import {
    routeForEventHistory,
    routeForWorkflow,
  } from '$lib/utilities/route-for';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import FilterOrCopyButtons from '$holocene/filter-or-copy-buttons.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import SelectableTableRow from '$lib/holocene/table/selectable-table-row.svelte';
  import { eventViewType } from '$lib/stores/event-view';

  export let bulkActionsEnabled: boolean = false;
  export let selected: boolean = false;
  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat | string;

  $: href = routeForEventHistory({
    view: $eventViewType,
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });

  let showFilterCopy = false;

  const onRowFilterClick = (
    attribute: 'WorkflowId' | 'WorkflowType',
    value: string,
  ) => {
    const filter = $workflowFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $workflowFilters.filter((f) => f.attribute !== attribute);

    if (!filter) {
      const newFilter = {
        attribute,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), newFilter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };
</script>

<svelte:component
  this={bulkActionsEnabled ? SelectableTableRow : TableRow}
  item={workflow}
  {selected}
  {href}
  class="workflow-summary-row"
>
  <td>
    <WorkflowStatus
      status={workflow.status}
      delay={getMilliseconds(workflow.startTime)}
    />
  </td>
  <td
    class="relative truncate"
    on:mouseover={() => (showFilterCopy = true)}
    on:focus={() => (showFilterCopy = true)}
    on:mouseleave={() => (showFilterCopy = false)}
    on:blur={() => (showFilterCopy = false)}
  >
    <span class="table-link">{workflow.id}</span>
    <FilterOrCopyButtons
      show={showFilterCopy}
      content={workflow.id}
      onFilter={() => onRowFilterClick('WorkflowId', workflow.id)}
      filtered={Boolean(
        $workflowFilters.find(
          (f) => f.attribute === 'WorkflowId' && f.value === workflow.id,
        ),
      )}
    />
    <p class="inline-time-cell">
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </td>
  <td
    class="relative truncate"
    on:mouseover={() => (showFilterCopy = true)}
    on:focus={() => (showFilterCopy = true)}
    on:mouseleave={() => (showFilterCopy = false)}
    on:blur={() => (showFilterCopy = false)}
  >
    <h3 class="md:hidden">Workflow Name:</h3>
    <span
      class="table-link"
      on:click|preventDefault|stopPropagation={() =>
        onRowFilterClick('WorkflowType', workflow.name)}>{workflow.name}</span
    >
    <FilterOrCopyButtons
      show={showFilterCopy}
      content={workflow.name}
      onFilter={() => onRowFilterClick('WorkflowType', workflow.name)}
      filtered={Boolean(
        $workflowFilters.find(
          (f) => f.attribute === 'WorkflowType' && f.value === workflow.name,
        ),
      )}
    />
    <p class="inline-time-cell">
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </td>
  <td class="time-cell">
    <p>
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </td>
  <td class="time-cell">
    <p>
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </td>
</svelte:component>

<style lang="postcss">
  :global(.workflow-summary-row:hover) {
    @apply bg-gray-50;

    .table-link {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }

  .time-cell {
    @apply hidden xl:table-cell;
  }

  .inline-time-cell {
    @apply hidden md:block xl:hidden;
  }
</style>
