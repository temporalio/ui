<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import { allSelected } from '$lib/pages/workflows-with-new-search.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { formatReason, getPlacholder } from '$lib/utilities/workflow-actions';
  import { Action } from '$lib/models/workflow-actions';

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

  $: actionText =
    action === Action.Cancel
      ? translate('cancel')
      : translate('workflows', 'terminate');
  $: confirmText = action === Action.Cancel ? translate('confirm') : actionText;

  $: placeholder = getPlacholder(action, $authUser.email);

  let reason: string = '';

  const handleConfirmModal = () => {
    dispatch('confirm', {
      reason: formatReason({ action, reason, email: $authUser.email }),
    });
  };

  const handleCancelModal = () => {
    reason = '';
  };
</script>

<Modal
  id="batch-operation-confirmation-modal"
  bind:this={modal}
  data-testid="batch-{actionText}-confirmation"
  confirmType="destructive"
  {confirmText}
  on:cancelModal={handleCancelModal}
  on:confirmModal={handleConfirmModal}
>
  <h3 slot="title">
    <Translate
      namespace="workflows"
      key="batch-operation-modal-title"
      replace={{ action: actionText }}
    />
  </h3>
  <svelte:fragment slot="content">
    <div class="mb-4 flex flex-col">
      {#if $allSelected}
        <p class="mb-2">
          <Translate
            namespace="workflows"
            key="batch-operation-confirmation-all"
            replace={{ action: actionText }}
          />
        </p>
        <div
          class="mb-2 overflow-scroll whitespace-nowrap rounded border border-primary bg-gray-100 p-2"
        >
          <code data-testid="batch-action-workflows-query">
            {query}
          </code>
        </div>
        <span class="text-xs">
          <Translate
            namespace="workflows"
            key="batch-operation-count-disclaimer"
            replace={{ action: actionText }}
          />
        </span>
      {:else}
        <p>
          <Translate
            namespace="workflows"
            key={action === Action.Cancel
              ? 'batch-cancel-confirmation'
              : 'batch-terminate-confirmation'}
            count={actionableWorkflowsLength}
          />
        </p>
      {/if}
    </div>
    <Input
      id="bulk-action-reason"
      bind:value={reason}
      label={translate('reason')}
      hintText={translate(
        'workflows',
        'batch-operation-confirmation-input-hint',
        { placeholder },
      )}
      {placeholder}
    />
  </svelte:fragment>
</Modal>
