<script lang="ts">
  import { ArrowCircleDown, ArrowCircleUp } from 'svelte-hero-icons';
  import { slide } from 'svelte/transition';
  import Icon from 'svelte-hero-icons/Icon.svelte';

  import { terminateWorkflow } from '$lib/services/terminate-service';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import { notifications } from '$lib/stores/notifications';
  import Button from '$lib/components/button/main-button.svelte';
  import { handleError } from '$lib/utilities/handle-error';
  import { isFunction } from '$lib/utilities/is-function';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: () => void;

  let isOpen: boolean = false;
  let reason: string = '';

  const isEligibleForTermination = (workflow: WorkflowExecution) =>
    String(workflow.status) === 'Running';

  const terminate = () => {
    terminateWorkflow({
      workflow,
      namespace,
      reason,
    })
      .then(() => {
        reason = '';
        isOpen = false;
        notifications.add('success', 'Workflow Terminated');
        if (isFunction(refresh)) refresh();
      })
      .catch(handleError);
  };
</script>

{#if isEligibleForTermination(workflow)}
  <div class="flex flex-col border-2 p-2 my-4">
    <div class="flex gap-2" class:mb-2={isOpen}>
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
        <input
          placeholder="Enter Reason (Optional)"
          bind:value={reason}
          class="w-full"
        />
        <Button variant="destroy" on:click={terminate}>Terminate</Button>
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  h4 {
    @apply font-semibold;
  }

  input {
    @apply py-2 px-4;
  }
</style>
