<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/workflow-actions';
  import { pauseWorkflow } from '$lib/services/workflow-service';
  import { pauseLiveUpdates } from '$lib/stores/events';
  import { toaster } from '$lib/stores/toaster';
  import { triggerRefresh } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  interface Props {
    open: boolean;
    workflow: WorkflowExecution;
    namespace: string;
  }

  let { open = $bindable(), workflow, namespace }: Props = $props();

  let reason: string = $state('');
  let error: string = $state('');
  let loading = $state(false);

  const identity = getIdentity();

  const hideModal = () => {
    open = false;
    reason = '';
  };

  const pause = async () => {
    error = '';
    loading = true;
    try {
      await pauseWorkflow({
        workflow,
        namespace,
        reason,
        identity,
      });
      open = false;
      reason = '';
      triggerRefresh(Action.Pause);
      toaster.push({
        id: 'workflow-pause-success-toast',
        message: translate('workflows.pause-success'),
      });
    } catch (err: unknown) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };
</script>

<Modal
  id="workflow-pause-confirmation-modal"
  data-testid="workflow-pause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.pause-workflow')}
  cancelText={translate('common.cancel')}
  on:cancelModal={hideModal}
  on:confirmModal={pause}
>
  <h3 slot="title">{translate('workflows.pause-workflow')}</h3>
  <div slot="content">
    <p>{translate('workflows.workflow-pause-description')}</p>
    <ul class="mt-4 list-disc pl-6">
      <li>{translate('workflows.workflow-pause-description-item-1')}</li>
      <li>{translate('workflows.workflow-pause-description-item-2')}</li>
      <li>{translate('workflows.workflow-pause-description-item-3')}</li>
    </ul>
    <Textarea
      id="workflow-pause-details"
      class="mt-4"
      placeholder={translate('common.reason-placeholder')}
      label={translate('common.reason')}
      labelHidden
      bind:value={reason}
    />
  </div>
</Modal>
