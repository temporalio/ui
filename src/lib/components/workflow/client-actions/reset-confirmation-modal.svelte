<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { ResetReapplyType } from '$lib/models/workflow-actions';
  import { resetWorkflow } from '$lib/services/workflow-service';
  import { resetEvents } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number>;

  let error = '';
  let loading = false;
  let eventId: Writable<string> = writable('');
  let reason: string;
  let reapplySignals = false;

  const hideResetModal = () => {
    open = false;
    reapplySignals = false;
    $eventId = '';
    reason = '';
  };

  const reset = async () => {
    error = '';
    loading = true;
    try {
      const response = await resetWorkflow({
        namespace,
        workflow,
        eventId: $eventId,
        reason,
        reapplyType: reapplySignals
          ? ResetReapplyType.Signal
          : ResetReapplyType.None,
      });

      if (response && response.runId) {
        resetWorkflows.update((previous) => ({
          ...previous,
          [workflow.runId]: response.runId,
        }));
      }
      $refresh = Date.now();
      hideResetModal();
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };
</script>

<Modal
  id="reset-confirmation-modal"
  data-testid="reset-confirmation-modal"
  confirmText={translate('common.confirm')}
  cancelText={translate('common.cancel')}
  bind:error
  bind:open
  {loading}
  on:confirmModal={reset}
  on:cancelModal={hideResetModal}
  confirmDisabled={!$eventId}
>
  <h3 slot="title">{translate('workflows.reset-modal-title')}</h3>
  <svelte:fragment slot="content">
    <div class="flex w-full flex-col gap-4">
      <RadioGroup
        name="reset-event-id"
        group={eventId}
        class="max-h-40 overflow-auto"
        description={translate('workflows.reset-event-radio-group-description')}
      >
        {#each $resetEvents as event}
          <RadioInput
            id="reset-event-{event.id}"
            value={event.id}
            label="{event.id} - {event.eventType}"
          />
        {/each}
      </RadioGroup>
      <Checkbox
        id="reset-reapply-type-checkbox"
        bind:checked={reapplySignals}
        label={translate('workflows.reset-reapply-type-label')}
      />

      <Input
        id="reset-reason"
        bind:value={reason}
        label={translate('common.reason')}
      />
    </div>
  </svelte:fragment>
</Modal>
