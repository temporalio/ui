<script lang="ts">
  import { page } from '$app/stores';

  import { formatDate } from '$lib/utilities/format-date';
  import { getMilliseconds } from '$lib/utilities/format-time';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';

  import type { TimeFormat } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat | string;

  $: href = routeForEventHistory({
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

<TableRow {href} class="workflow-summary-row">
  <td>
    <WorkflowStatus
      status={workflow.status}
      delay={getMilliseconds(workflow.startTime)}
    />
  </td>
  <td
    class="relative break-words pr-4"
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
    <button
      class="table-link"
      on:click|preventDefault|stopPropagation={() => onTypeClick(workflow.name)}
      aria-label="filter by {workflow.name} type"
    >
      {workflow.name}
    </button>
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
    @apply bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;

    .table-link {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }

  .time-cell {
    @apply max-xl:hidden;
  }

  .inline-time-cell {
    @apply hidden md:block xl:hidden;
  }
</style>
