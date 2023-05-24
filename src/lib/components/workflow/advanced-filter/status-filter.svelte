<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import KeywordConditionals from './keyword-conditionals.svelte';
  import { translate } from '$lib/i18n/translate';

  export let value = '';
  export let conditional = '';

  const statuses = {
    All: translate('all'),
    Running: translate('workflows', 'running'),
    'Timed Out': translate('workflows', 'timed-out'),
    Completed: translate('workflows', 'completed'),
    Failed: translate('workflows', 'failed'),
    'Continued as New': translate('workflows', 'continued-as-new'),
    Canceled: translate('workflows', 'canceled'),
    Terminated: translate('workflows', 'terminated'),
  };
</script>

<div class="flex gap-2">
  <KeywordConditionals bind:conditional />
  <Select id="workflow-status" bind:value class="w-44">
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
