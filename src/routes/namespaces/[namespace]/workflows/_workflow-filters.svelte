<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import { createWorkflowStore } from '$lib/stores/workflows';

  import Select from '$lib/components/filter-select.svelte';
  import Input from '$lib/components/filter-input.svelte';
  import TimeRangeSelect from '$lib/components/time-range-select.svelte';

  export let timeFormat: string = 'relative';

  $: store = createWorkflowStore($namespace);
  $: workflowTypes = store.workflowTypes;
  $: filters = store.filters;
  $: range = store.range;

  $: status = filters.status;
  $: workflowType = filters.workflowType;
  $: executionId = filters.executionId;
  $: runId = filters.runId;

  function clear() {
    $status = null;
    $workflowType = null;
    $executionId = null;
    $runId = null;
    timeFormat = 'relative';
  }
</script>

<section class="p-4 flex gap-8">
  <TimeRangeSelect {range} key="workflows" />
  <Select
    id="filter-by-workflow-status"
    name="Workflow Status"
    bind:value={$status}
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
    bind:value={$workflowType}
  >
    <option value={null} />
    {#each $workflowTypes as name}
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
    bind:value={$executionId}
  />
  <Input name="Run ID" id="filter-by-run-id" bind:value={$runId} />
  <button on:click={clear}>Clear</button>
</section>

