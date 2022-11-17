<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { pluralize } from '$lib/utilities/pluralize';
  import Input from '$lib/holocene/input/input.svelte';
  export let open: boolean;
  export let action: 'Terminate' | 'Cancel';
  export let loading: boolean;
  export let allSelected: boolean;
  export let actionableWorkflowsLength: number;
  export let query: string;

  const dispatch = createEventDispatcher<{
    confirm: { reason: string };
  }>();

  let reason: string;

  const handleConfirmModal = () => {
    dispatch('confirm', { reason });
    open = false;
    reason = '';
  };

  const handleCancelModal = () => {
    open = false;
    reason = '';
  };

  $: confirmText = action === 'Cancel' ? 'Confirm' : action;
</script>

<Modal
  {open}
  confirmType="destructive"
  confirmDisabled={reason === ''}
  {confirmText}
  {loading}
  on:cancelModal={handleCancelModal}
  on:confirmModal={handleConfirmModal}
>
  <h3 slot="title">{action} Workflows</h3>
  <svelte:fragment slot="content">
    <div class="mb-4 flex flex-col">
      {#if allSelected}
        <p class="mb-2">
          Are you sure you want to {action.toLowerCase()} all worklfows matching
          the following query? This action cannot be undone.
        </p>
        <div
          class="mb-2 overflow-scroll whitespace-nowrap rounded border border-primary bg-gray-100 p-2"
        >
          <code>
            {query}
          </code>
        </div>
        <span class="text-xs"
          >Note: The actual count of workflows that will be affected is the
          total number of running workflows matching this query at the time of
          clicking "{confirmText}".</span
        >
      {:else}
        <p class="mb-4">
          Are you sure you want to {action.toLowerCase()}
          <strong
            >{actionableWorkflowsLength} running {pluralize(
              'workflow',
              actionableWorkflowsLength,
            )}</strong
          >?
        </p>
      {/if}
    </div>
    <Input
      id="bulk-action-reason"
      bind:value={reason}
      placeholder="Enter a reason"
    />
  </svelte:fragment>
</Modal>
