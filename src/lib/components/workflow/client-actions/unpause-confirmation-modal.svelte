<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Action } from '$lib/models/workflow-actions';
  import { unpauseWorkflow } from '$lib/services/workflow-service';
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

  const unpause = async () => {
    error = '';
    loading = true;
    try {
      await unpauseWorkflow({
        workflow,
        namespace,
        reason,
        identity,
      });
      open = false;
      reason = '';
      triggerRefresh(Action.Unpause);
      toaster.push({
        id: 'workflow-unpause-success-toast',
        message: translate('workflows.unpause-success'),
      });
    } catch (err: unknown) {
      error =
        isNetworkError(err) && err.message
          ? err.message
          : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };
</script>

<Modal
  id="unpause-confirmation-modal"
  data-testid="unpause-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('workflows.unpause-workflow')}
  cancelText={translate('common.cancel')}
  on:cancelModal={hideModal}
  on:confirmModal={unpause}
>
  <h3 slot="title">{translate('workflows.unpause-workflow')}</h3>
  <div slot="content">
    <Textarea
      id="workflow-unpause-details"
      class="mt-4"
      placeholder={translate('common.reason-placeholder')}
      label={translate('common.reason')}
      bind:value={reason}
    />
  </div>
</Modal>
