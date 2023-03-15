<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import ExecutionStatusDropdownFilter from '../dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from '../dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from '../dropdown-filter/workflow-type.svelte';
  import StartTimeDropdownFilter from '../dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from '../dropdown-filter/end-time.svelte';

  export let column: WorkflowHeader;
  export let sortDisabled: boolean;
</script>

{#if column === 'Status'}
  <th class="w-32">
    <ExecutionStatusDropdownFilter />
  </th>
{:else if column === 'Workflow ID'}
  <th>
    <WorkflowIdDropdownFilter />
  </th>
{:else if column === 'Type'}
  <th class="xl:w-60">
    <WorkflowTypeDropdownFilter />
  </th>
{:else if column === 'Start'}
  <th class="w-60 max-xl:hidden">
    <StartTimeDropdownFilter disabled={sortDisabled} />
  </th>
{:else if column === 'End'}
  <th class="w-60 max-xl:hidden">
    <EndTimeDropdownFilter disabled={sortDisabled} />
  </th>
{:else}
  <th>{column}</th>
{/if}
