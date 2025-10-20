<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { resetWorkflow } from '$lib/services/workflow-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { resetEvents } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { temporalVersion } from '$lib/stores/versions';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number>;
  export let presetEventId: string = '';
  export let onResetCompletion: ({
    runId,
  }: {
    runId: string;
  }) => void = () => {};

  let error = '';
  let loading = false;
  let eventId: Writable<string> = writable(presetEventId);
  let reason: string;
  let includeSignals = true;
  let excludeSignals = false;

  let workflowUpdateOptions = false;
  let overrideBehavior = 'pinned';
  let deploymentName = '';
  let buildId = '';

  let excludeUpdates = false;

  const identity = getIdentity();

  const hideResetModal = () => {
    open = false;
    includeSignals = true;
    excludeSignals = false;
    excludeUpdates = false;
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
        includeSignals,
        excludeSignals,
        excludeUpdates,
        identity,
      });

      if (onResetCompletion) {
        onResetCompletion(response);
      }

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
    hideResetModal();
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
      <Select
        data-testid="workflow-reset-event-id-select"
        menuClass="max-h-[16rem]"
        label={translate('workflows.reset-event-radio-group-description')}
        bind:value={$eventId}
        id="reset-event-id"
      >
        {#each $resetEvents as event}
          <Option value={event.id}>{event.id} - {event.eventType}</Option>
        {/each}
      </Select>
      {#if $isCloud || minimumVersionRequired('1.24.0', $temporalVersion)}
        <Checkbox
          id="reset-exclude-signals-checkbox"
          data-testid="reset-exclude-signals-checkbox"
          bind:checked={excludeSignals}
          label={translate('workflows.reset-exclude-signals')}
        />
        <Checkbox
          id="reset-exclude-updates-checkbox"
          data-testid="reset-exclude-updates-checkbox"
          bind:checked={excludeUpdates}
          label={translate('workflows.reset-exclude-updates')}
        />
      {:else}
        <Checkbox
          id="reset-include-signals-checkbox"
          data-testid="reset-include-signals-checkbox"
          bind:checked={includeSignals}
          label={translate('workflows.reset-reapply-type-label')}
        />
      {/if}

      <Input
        id="reset-reason"
        bind:value={reason}
        label={translate('common.reason')}
      />

      <!-- {#if $isCloud || minimumVersionRequired('1.28.0', $temporalVersion)} -->
      <Checkbox
        id="reset-pinned-override-behavior-checkbox"
        data-testid="reset-pinned-override-behavior-checkbox"
        bind:checked={workflowUpdateOptions}
        label="Update Workflow Options"
      />

      {#if workflowUpdateOptions}
        <Select
          id="reset-override-behavior-select"
          data-testid="reset-override-behavior-select"
          bind:value={overrideBehavior}
          label={translate('workflows.reset-override-behavior-label')}
        >
          <Option value="pinned">Pinned</Option>
          <Option value="unspecified">Auto-Upgrade</Option>
        </Select>
        <Input
          id="reset-deployment-name"
          data-testid="reset-deployment-name"
          bind:value={deploymentName}
          label={translate('workflows.reset-deployment-name-label')}
        />
        <Input
          id="reset-build-id"
          data-testid="reset-build-id"
          bind:value={buildId}
          label={translate('workflows.reset-build-id-label')}
        />
      {/if}
      <!-- {/if} -->
    </div>
  </svelte:fragment>
</Modal>
