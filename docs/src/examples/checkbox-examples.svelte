<script lang="ts">
  import { Checkbox, CheckboxGroup } from '$lib/io-ark/checkbox';

  const taskQueues = ['orders', 'payments', 'notifications'];
  let selectedQueues = $state(['orders']);
  let statuses = $state(['running', 'failed']);
  let resetPoints = $state(true);

  const allSelected = $derived(selectedQueues.length === taskQueues.length);
  const someSelected = $derived(selectedQueues.length > 0 && !allSelected);
</script>

<div class="grid gap-8 sm:grid-cols-2">
  <div class="flex flex-col gap-3">
    <Checkbox
      label="All task queues"
      checked={allSelected}
      indeterminate={someSelected}
      onCheckedChange={(checked) =>
        (selectedQueues = checked ? [...taskQueues] : [])}
    />
    <CheckboxGroup
      label="Task queues"
      labelHidden
      class="ml-8"
      bind:value={selectedQueues}
    >
      {#each taskQueues as queue (queue)}
        <Checkbox label={queue} value={queue} />
      {/each}
    </CheckboxGroup>
  </div>

  <CheckboxGroup
    label="Execution status"
    helperText="Show workflows with any of these statuses."
    bind:value={statuses}
  >
    <Checkbox label="Running" value="running" />
    <Checkbox label="Completed" value="completed" />
    <Checkbox label="Failed" value="failed" />
    <Checkbox label="Terminated" value="terminated" disabled />
  </CheckboxGroup>

  <Checkbox
    label="Keep reset points"
    helperText="Lets you reset the workflow to an earlier event."
    bind:checked={resetPoints}
  />

  <Checkbox
    label="I understand this terminates 12 workflows"
    required
    error="Confirm before terminating these workflows."
  />
</div>
