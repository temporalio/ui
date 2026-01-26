<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { terminateActivityExecution } from '$lib/services/standalone-activities';
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
  let reason = $state('');

  const identity = getIdentity();

  const terminate = async () => {
    error = '';
    loading = true;
    try {
      await terminateActivityExecution(
        namespace,
        activityExecutionInfo.activityId,
        activityExecutionInfo.runId,
        reason,
        identity,
      );
      open = false;
      toaster.push({
        id: 'activity-terminate-success-toast',
        message: translate('activities.terminate-success'),
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
  id="terminate-confirmation-modal"
  data-testid="terminate-confirmation-modal"
  confirmText={translate('activities.terminate')}
  cancelText={translate('common.cancel')}
  bind:error
  bind:open
  {loading}
  confirmType="destructive"
  on:confirmModal={terminate}
>
  <h3 slot="title">{translate('activities.terminate-modal-title')}</h3>
  <div class="space-y-2" slot="content">
    <p>
      {translate('activities.terminate-modal-confirmation')}
    </p>

    <Input
      id="terminate-activity-execution-reason"
      label={translate('common.reason-placeholder')}
      labelHidden
      bind:value={reason}
      placeholder={translate('common.reason-placeholder')}
    />
  </div>
</Modal>
