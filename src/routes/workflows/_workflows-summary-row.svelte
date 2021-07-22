<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Cell from './_workflows-summary-cell.svelte';

  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';
  import { formatDate } from '$lib/utilities/format-date';

  export let workflow: WorkflowExecutionAPIResponse;
  let workflowUrl = `/workflows/${workflow.execution.workflowId}/${workflow.execution.runId}`;

  $: isActive = pathMatches(workflowUrl, $page.path);
  $: rowStyle = isActive ? 'bg-yellow-200' : 'bg-gray-50 hover:bg-gray-100';
</script>

<tr class={rowStyle}>
  <Cell {workflowUrl}>
    <h3>
      {workflow.type.name}
    </h3>
    <p>
      {workflow.execution.runId}
    </p>
  </Cell>
  <Cell {workflowUrl}>
    <WorkflowStatus status={workflow.status} />
  </Cell>
  <Cell {workflowUrl}>
    <p>{formatDate(workflow.startTime)}</p>
  </Cell>
  <Cell {workflowUrl}>
    <p>{formatDate(workflow.closeTime)}</p>
  </Cell>
</tr>

<style lang="postcss">
  h3 {
    @apply font-normal;
    @apply m-0;
    @apply text-base;
    @apply text-gray-900;
  }

  p {
    @apply m-0;
    @apply text-gray-500;
    @apply text-sm;
  }
</style>
