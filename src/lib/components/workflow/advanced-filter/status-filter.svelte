<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import KeywordConditionals from './keyword-conditionals.svelte';
  import { workflowStatusFilters } from '$lib/models/workflow-status';

  export let value = '';
  export let conditional = '';
</script>

<div class="flex gap-2">
  <KeywordConditionals bind:conditional />
  <Select id="workflow-status" bind:value class="w-44">
    {#each Object.entries(workflowStatusFilters) as [value, label] (label)}
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
