<script lang="ts">
  import Select from '$lib/components/filter-select.svelte';
  import Input from '$lib/components/filter-input.svelte';

  export let status: WorkflowStatus = null;
  export let workflowType: WorkflowType = null;
  export let executionId: string = null;
  export let runId: string = null;
  export let timeFormat: string = 'relative';
  export let workflowTypes: string[];

  function clear() {
    status = null;
    workflowType = null;
    executionId = null;
    runId = null;
    timeFormat = 'relative';
  }
</script>

<section class="p-4 flex gap-8">
  <Select
    id="filter-by-workflow-status"
    name="Workflow Status"
    bind:value={status}
  >
    <option value={null} />
    <option value="Running">Running</option>
    <option value="TimedOut">Timed Out</option>
    <option value="Completed">Completed</option>
    <option value="Failed">Failed</option>
    <option value="ContinuedAsNew">Continued as New</option>
    <option value="Canceled">Canceled</option>
    <option value="Terminated">Terminated</option>
  </Select>
  <Select
    id="filter-by-workflow-type"
    name="Workflow Type"
    bind:value={workflowType}
  >
    <option value={null} />
    {#each workflowTypes as name}
      <option>{name}</option>
    {/each}
  </Select>
  <Select
    id="filter-by-relative-time"
    name="Time Format"
    bind:value={timeFormat}
  >
    <option value={'relative'}>Relative</option>
    <option value={'UTC'}>UTC</option>
    <option value={'current'}>Current</option>
  </Select>
  <Input
    name="Execution ID"
    id="filter-by-execution-id"
    bind:value={executionId}
  />
  <Input name="Run ID" id="filter-by-run-id" bind:value={runId} />
  <button on:click={clear}>Clear</button>
</section>

<style lang="postcss">
  button {
    @apply text-purple-700 py-4 px-6 border-purple-400 border-2 rounded-md;
  }

  button:hover {
    @apply bg-purple-100;
  }
</style>
