<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { v4 } from 'uuid';

  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import { allSelected } from '$lib/pages/workflows-with-new-search.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import { formatReason, getPlacholder } from '$lib/utilities/workflow-actions';

  export let action: Action;
  export let actionableWorkflowsLength: number;
  export let query: string;

  let reason = '';
  let isOpen = false;
  let error = '';
  let jobId = '';
  let jobIdPlaceholder = v4();
  let jobIdValid = true;

  export const open = () => {
    reason = '';
    isOpen = true;
  };
  export const close = () => (isOpen = false);
  export const setError = (err: string) => (error = err);

  const dispatch = createEventDispatcher<{
    confirm: { reason: string; jobId: string };
  }>();

  $: actionText =
    action === Action.Cancel
      ? translate('common.cancel')
      : translate('workflows.terminate');
  $: confirmText =
    action === Action.Cancel ? translate('common.confirm') : actionText;

  $: placeholder = getPlacholder(action, $authUser.email);

  const handleConfirmModal = () => {
    error = '';
    dispatch('confirm', {
      reason: formatReason({ action, reason, email: $authUser.email }),
      jobId: jobId || jobIdPlaceholder,
    });
  };

  const handleJobIdChange = (event: Event & { target: HTMLInputElement }) => {
    if (/^[\w.~-]*$/.test(event.target.value)) {
      jobIdValid = true;
    } else {
      jobIdValid = false;
    }
  };
</script>

<Modal
  id={`batch-operation-confirmation-modal-${action}`}
  bind:open={isOpen}
  bind:error
  data-testid="batch-{actionText}-confirmation"
  confirmType="destructive"
  cancelText={translate('common.cancel')}
  confirmDisabled={!jobIdValid}
  {confirmText}
  on:confirmModal={handleConfirmModal}
>
  <h3 slot="title">
    <Translate
      key="workflows.batch-operation-modal-title"
      replace={{ action: actionText }}
    />
  </h3>
  <svelte:fragment slot="content">
    <div class="mb-4 flex flex-col gap-2">
      {#if $allSelected}
        <p class="mb-2">
          <Translate
            key="workflows.batch-operation-confirmation-all"
            replace={{ action: actionText }}
          />
        </p>
        <div
          class="mb-2 overflow-scroll whitespace-nowrap rounded border border-primary bg-badge p-2"
        >
          <code data-testid="batch-action-workflows-query">
            {query}
          </code>
        </div>
        <span class="text-xs">
          <Translate
            key="workflows.batch-operation-count-disclaimer"
            replace={{ action: actionText }}
          />
        </span>
      {:else}
        <p>
          <Translate
            key={action === Action.Cancel
              ? 'workflows.batch-cancel-confirmation'
              : 'workflows.batch-terminate-confirmation'}
            count={actionableWorkflowsLength}
          />
        </p>
      {/if}
      <Input
        id={`bulk-action-reason-${action}`}
        bind:value={reason}
        label={translate('common.reason')}
        hintText={translate(
          'workflows.batch-operation-confirmation-input-hint',
          { placeholder },
        )}
        {placeholder}
      />
      <Input
        id="batch-operation-job-id"
        label={translate('common.job-id')}
        hintText={jobIdValid
          ? translate('batch.job-id-input-hint')
          : translate('batch.job-id-input-error')}
        bind:value={jobId}
        placeholder={jobIdPlaceholder}
        on:input={handleJobIdChange}
        valid={jobIdValid}
      />
    </div>
  </svelte:fragment>
</Modal>
