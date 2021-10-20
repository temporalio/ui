<script lang="ts">
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { ArrowCircleDown, ArrowCircleUp } from 'svelte-hero-icons';
  import { slide } from 'svelte/transition';

  export let workflow: WorkflowExecution;
  export let namespace: string;

  let isOpen: boolean = false;
  let reason: string = '';

  const isEligibleForTermination = (workflow: WorkflowExecution) =>
    String(workflow.status) === 'Running';

  const terminate = () => {
    terminateWorkflow({
      workflow,
      namespace,
      reason,
    });

    reason = '';
    isOpen = false;
  };
</script>

{#if isEligibleForTermination(workflow)}
  <div class="flex flex-col border-2 p-2 my-4">
    <div class="flex gap-2">
      <h4>Terminate Execution</h4>
      <span on:click={() => (isOpen = !isOpen)}>
        <Icon
          src={isOpen ? ArrowCircleDown : ArrowCircleUp}
          class={`mt-1 w-5 h-5 text-gray-500 cursor-pointer`}
        />
      </span>
    </div>

    {#if isOpen}
      <div transition:slide class="flex gap-4 justify-between">
        <input placeholder="Enter Reason" bind:value={reason} />
        <button class="terminate" disabled={!reason} on:click={terminate}>
          Terminate
        </button>
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  h4 {
    @apply font-semibold;
  }

  input {
    @apply border-b-2 border-gray-300 py-2 px-4;
  }

  .terminate {
    @apply bg-red-200 text-red-600 py-2 px-4 mt-2 rounded text-sm uppercase;
  }
</style>
