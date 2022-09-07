<script>import { page } from '$app/stores';
import { formatDate, getMilliseconds } from '../../utilities/format-date';
import { routeForWorkflow } from '../../utilities/route-for';
import { updateQueryParameters } from '../../utilities/update-query-parameters';
import { toListWorkflowParameters } from '../../utilities/query/to-list-workflow-parameters';
import { toListWorkflowQuery } from '../../utilities/query/list-workflow-query';
import WorkflowStatus from '../workflow-status.svelte';
import FilterOrCopyButtons from '$holocene/filter-or-copy-buttons.svelte';
import TableRow from '$holocene/table/table-row.svelte';
export let namespace;
export let workflow;
export let timeFormat;
$: href = routeForWorkflow({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
});
let showFilterCopy = false;
const onTypeClick = (type) => {
    const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
    const query = $page.url.searchParams.get('query');
    const parameters = toListWorkflowParameters(query !== null && query !== void 0 ? query : defaultQuery);
    const workflowType = (parameters === null || parameters === void 0 ? void 0 : parameters.workflowType) === type ? '' : type;
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

<style>
  :global(.workflow-summary-row:hover) {

    --tw-bg-opacity: 1;

    background-color: rgb(250 250 250 / var(--tw-bg-opacity))
}

    :global(.workflow-summary-row:hover) .table-link {

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity));

    -webkit-text-decoration-line: underline;

            text-decoration-line: underline;

    -webkit-text-decoration-color: #1d4ed8;

            text-decoration-color: #1d4ed8
}

  .time-cell {

    display: none
}

  @media (min-width: 1280px) {

    .time-cell {

        display: table-cell
    }
}

  .inline-time-cell {

    display: none
}

  @media (min-width: 768px) {

    .inline-time-cell {

        display: block
    }
}

  @media (min-width: 1280px) {

    .inline-time-cell {

        display: none
    }
}</style>
