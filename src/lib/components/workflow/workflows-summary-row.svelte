<script lang="ts">
  import { page } from '$app/stores';

  import { formatDate, getMilliseconds } from '$lib/utilities/format-date';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import FilterOrCopyButtons from '$holocene/filter-or-copy-buttons.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat | string;

  $: href = routeForWorkflow({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });

  let showFilterCopy = false;

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'WorkflowType');

  $: typeFilter = $workflowFilters.find((f) => f.attribute === 'WorkflowType');

  const onTypeClick = (type: string) => {
    if (!typeFilter) {
      const filter = {
        attribute: 'WorkflowType',
        value: type,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }
  };
</script>

<TableRow {href} class="workflow-summary-row">
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
      filterable={false}
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
      on:click|preventDefault|stopPropagation={() => onTypeClick(workflow.name)}
      >{workflow.name}</span
    >
    <FilterOrCopyButtons
      show={showFilterCopy}
      content={workflow.name}
      onFilter={() => onTypeClick(workflow.name)}
      filtered={$page.url?.searchParams?.get('query')?.includes(workflow.name)}
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
</TableRow>

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
