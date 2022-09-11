<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let value = '';

  const operations = {
    Is: 'Is',
    'Is Not': 'IsNot',
  };

  const statuses = {
    All: 'All',
    Running: 'Running',
    'Timed Out': 'TimedOut',
    Completed: 'Completed',
    Failed: 'Failed',
    'Continued as New': 'ContinuedAsNew',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  let operator: keyof typeof operations = 'Is';
</script>

<div class="flex gap-2">
  <Select showIcon={false} disabled id="operator-filter" bind:value={operator}>
    {#each Object.entries(operations) as [label, value] (label)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
  <Select
    id="workflow-status"
    bind:value
    class="w-44"
    displayValue={(value) => {
      if (!value) return 'All';
      return value;
    }}
  >
    {#each Object.entries(statuses) as [label, value] (label)}
      <Option value={label}>
        {#if value !== 'All'}
          <WorkflowStatus status={value} />
        {:else}
          {label}
        {/if}
      </Option>
    {/each}
  </Select>
</div>
