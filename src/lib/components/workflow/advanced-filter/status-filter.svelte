<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import KeywordConditionals from './keyword-conditionals.svelte';

  export let value = '';
  export let conditional = '';

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
</script>

<div class="flex gap-2">
  <KeywordConditionals bind:conditional />
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
