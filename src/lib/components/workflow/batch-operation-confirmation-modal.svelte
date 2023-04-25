<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { pluralize } from '$lib/utilities/pluralize';
  import Input from '$lib/holocene/input/input.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import {
    BATCH_ACTION_CONTEXT,
    type BatchActionContext,
  } from '$lib/pages/workflows-with-new-search.svelte';

  const { allSelected } = getContext<BatchActionContext>(BATCH_ACTION_CONTEXT);

  type Action = 'Terminate' | 'Cancel';

  export let action: Action;
  export let actionableWorkflowsLength: number;
  export let query: string;

  let modal: Modal;
  export const open = () => modal.open();
  export const close = () => modal.close();
  export const setError = (error: string) => modal.setError(error);

  const dispatch = createEventDispatcher<{
    confirm: { reason: string };
  }>();

  $: confirmText = action === 'Cancel' ? 'Confirm' : action;
  $: placeholder = `${pastTense(action)} from Web UI${
    $authUser?.email ? ` by ${$authUser.email}` : ''
  }`;

  let reason: string = '';

  const pastTense = (action: Action) => {
    if (action === 'Cancel') return 'Canceled';
    return 'Terminated';
  };

  const handleConfirmModal = () => {
    dispatch('confirm', { reason: [reason.trim(), placeholder].join(' ') });
  };

  const handleCancelModal = () => {
    reason = '';
  };
</script>

<Modal
  bind:this={modal}
  data-testid="batch-{action}-confirmation"
  confirmType="destructive"
  {confirmText}
  on:cancelModal={handleCancelModal}
  on:confirmModal={handleConfirmModal}
>
  <h3 slot="title">{action} Workflows</h3>
  <svelte:fragment slot="content">
    <div class="mb-4 flex flex-col">
      {#if $allSelected}
        <p class="mb-2">
          Are you sure you want to {action.toLowerCase()} all worklfows matching
          the following query? This action cannot be undone.
        </p>
        <div
          class="mb-2 overflow-scroll whitespace-nowrap rounded border border-primary bg-gray-100 p-2"
        >
          <code data-testid="batch-action-workflows-query">
            {query}
          </code>
        </div>
        <span class="text-xs"
          >Note: The actual count of workflows that will be affected is the
          total number of running workflows matching this query at the time of
          clicking "{confirmText}".</span
        >
      {:else}
        <p>
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
      label="Reason"
      id="bulk-action-reason"
      bind:value={reason}
      {placeholder}
      hintText={`If you supply a custom reason, "${placeholder}" will be appended to it.`}
    />
  </svelte:fragment>
</Modal>
