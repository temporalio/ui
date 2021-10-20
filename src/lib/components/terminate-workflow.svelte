<script lang="ts">
  import { terminateWorkflow } from '$lib/services/terminate-service';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { ArrowCircleDown } from 'svelte-hero-icons';

  export let workflow: WorkflowExecution;
  export let namespace: string;

  let dropdown: boolean = false;
  let reason: string = '';
</script>

<div class="flex flex-col">
  <span on:click={() => (dropdown = !dropdown)}>
    <Icon src={ArrowCircleDown} class={`mt-1 w-5 h-5 text-gray-500 cursor-pointer ${dropdown ? 'opened' : 'closed'}`} />
  </span>

  {#if !dropdown}
    <div>
      <input placeholder="Enter Reason" bind:value={reason} />
      <button
        class="mt-2 p-1 terminate rounded text-sm uppercase"
        on:click={() =>
          terminateWorkflow({
            workflow,
            namespace,
            reason,
          })}>Terminate</button
      >
    </div>
  {/if}
</div>

<style lang="postcss">
  .terminate {
    @apply bg-red-200 text-red-600;
  }

  .closed {
      @apply transition-transform;
  }

  .opened {
      @apply transform rotate-180;
  }
</style>
