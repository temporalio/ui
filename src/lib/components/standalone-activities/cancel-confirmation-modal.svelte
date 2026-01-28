<script lang="ts">
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { cancelActivityExecution } from '$lib/services/standalone-activities';
  import { toaster } from '$lib/stores/toaster';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  interface Props {
    open: boolean;
    activityExecutionInfo: ActivityExecutionInfo;
    namespace: string;
    onConfirm: () => void;
  }

  let {
    open = $bindable(),
    activityExecutionInfo,
    namespace,
    onConfirm,
  }: Props = $props();

  let loading = $state(false);
  let error = $state('');

  const identity = getIdentity();

  const cancel = async () => {
    error = '';
    loading = true;
    try {
      await cancelActivityExecution(
        namespace,
        activityExecutionInfo.activityId,
        activityExecutionInfo.runId,
        identity,
      );
      open = false;
      toaster.push({
        id: 'activity-cancellation-success-toast',
        message: translate('standalone-activities.cancel-success'),
      });
      onConfirm();
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
  id="cancel-confirmation-modal"
  data-testid="cancel-confirmation-modal"
  confirmText={translate('common.confirm')}
  cancelText={translate('common.cancel')}
  bind:error
  bind:open
  {loading}
  confirmType="destructive"
  on:confirmModal={cancel}
>
  <h3 slot="title">{translate('standalone-activities.cancel-modal-title')}</h3>
  <svelte:fragment slot="content">
    <p>
      {translate('standalone-activities.cancel-modal-confirmation')}
    </p>
  </svelte:fragment>
</Modal>
