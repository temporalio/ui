<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import KeywordConditionals from './keyword-conditionals.svelte';
  import { workflowStatusFilters } from '$lib/models/workflow-status';
  import Translate from '$lib/i18n/translate.svelte';

  export let value = '';
  export let conditional = '';
</script>

<div class="flex gap-2">
  <KeywordConditionals bind:conditional />
  <Select id="workflow-status" bind:value class="w-44">
    {#each workflowStatusFilters as status (status)}
      <Option value={status}>
        {#if status === 'All'}
          <Translate namespace="workflows" key="all-statuses" />
        {:else}
          <WorkflowStatus {status} />
        {/if}
      </Option>
    {/each}
  </Select>
</div>
