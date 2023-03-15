<script lang="ts">
  import { page } from '$app/stores';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    isDataCell,
    isPathCell,
    type WorkflowHeader,
    WORKFLOW_CELLS,
  } from '$lib/stores/workflow-table-columns';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  export let column: WorkflowHeader;
  export let workflow: WorkflowExecution;

  let cellContent: string;
  let filterOrCopyButtonsVisible: boolean = false;

  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);

  const onRowFilterClick = (header: WorkflowHeader, value: string) => {
    const attribute = header === 'Workflow ID' ? 'WorkflowId' : 'WorkflowType';
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

  $: cell = WORKFLOW_CELLS[column];
  $: {
    if (isPathCell(cell)) {
      cellContent = workflow[cell.path] ?? '';
    } else if (isDataCell(cell)) {
      cellContent = cell.data(workflow, $timeFormat) ?? '';
    }
  }
</script>

{#if column === 'Status'}
  <td>
    <WorkflowStatus status={workflow.status} />
  </td>
{:else if column === 'Type' || column === 'Workflow ID'}
  <td
    class="relative"
    on:mouseover={showFilterOrCopy}
    on:focus={showFilterOrCopy}
    on:mouseleave={hideFilterOrCopy}
    on:blur={hideFilterOrCopy}
  >
    <span class="table-link">{cellContent}</span>
    <FilterOrCopyButtons
      show={filterOrCopyButtonsVisible}
      content={cellContent}
      onFilter={() => onRowFilterClick(column, cellContent)}
      filtered={$workflowFilters.some(
        (filter) => filter.attribute === column && filter.value === cellContent,
      )}
    />
  </td>
{:else if column === 'Memo'}
  <td>
    {#if cellContent}
      <CodeBlock content={cellContent} inline copyable={false} />
    {/if}
  </td>
{:else}
  <td>{cellContent}</td>
{/if}
