<script lang="ts">
  import Select from '$lib/components/filter-select.svelte';

  export let status: WorkflowStatus = null;
  export let workflowType: WorkflowType = null;
  export let workflowTypes: string[];
</script>

<section class="p-4 flex gap-8">
  <Select id="workflow-status" name="Workflow Status" bind:value={status}>
    <option value={null} />
    <option value="Running">Running</option>
    <option value="TimedOut">Timed Out</option>
    <option value="Completed">Completed</option>
    <option value="Failed">Failed</option>
    <option value="Completed">Completed</option>
    <option value="ContinuedAsNew">Continued as New</option>
    <option value="Canceled">Canceled</option>
    <option value="Terminated">Terminated</option>
  </Select>
  <Select id="workflow-type" name="Workflow Type" bind:value={workflowType}>
    <option value={null} />
    {#each workflowTypes as name}
      <option>{name}</option>
    {/each}
  </Select>
</section>
