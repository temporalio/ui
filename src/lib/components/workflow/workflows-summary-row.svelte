<script lang="ts">
  import { page } from '$app/stores';

  import { formatDate, getMilliseconds } from '$lib/utilities/format-date';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import FilterOrCopyButtons from '$holocene/filter-or-copy-buttons.svelte';
  import SelectableTableRow from '$holocene/table/selectable-table-row.svelte';
  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat | string;
  export let selected: boolean;

  $: href = routeForWorkflow({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });

  let showFilterCopy = false;

  const onTypeClick = (type: string) => {
    const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
    const query = $page.url.searchParams.get('query');
    const parameters = toListWorkflowParameters(query ?? defaultQuery);
    const workflowType = parameters?.workflowType === type ? '' : type;
    const value = toListWorkflowQuery({
      ...parameters,
      workflowType,
    });
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value,
      allowEmpty: true,
    });
  };
</script>

<SelectableTableRow
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
</SelectableTableRow>

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
