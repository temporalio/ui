<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import ExecutionStatusDropdownFilter from '../dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from '../dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from '../dropdown-filter/workflow-type.svelte';
  import StartTimeDropdownFilter from '../dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from '../dropdown-filter/end-time.svelte';

  export let column: WorkflowHeader;
  export let sortDisabled: boolean;

  $: ({ label } = column);
</script>

{#if label === 'Status'}
  <th>
    <ExecutionStatusDropdownFilter />
  </th>
{:else if label === 'Workflow ID'}
  <th>
    <WorkflowIdDropdownFilter />
  </th>
{:else if label === 'Type'}
  <th>
    <WorkflowTypeDropdownFilter />
  </th>
{:else if label === 'Start'}
  <th>
    <StartTimeDropdownFilter disabled={sortDisabled} />
  </th>
{:else if label === 'End'}
  <th>
    <EndTimeDropdownFilter disabled={sortDisabled} />
  </th>
{:else}
  <th>{label}</th>
{/if}
