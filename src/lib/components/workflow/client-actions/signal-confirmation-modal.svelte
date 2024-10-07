<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import PayloadInput, {
    type PayloadInputEncoding,
  } from '$lib/components/payload-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { signalWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number>;

  let error: string = '';
  let loading = false;
  let name = '';

  let encoding: Writable<PayloadInputEncoding> = writable('json/plain');
  let input = '';

  const hideSignalModal = () => {
    open = false;
    name = '';
  };

  const signal = async () => {
    error = '';
    loading = true;
    try {
      await signalWorkflow({
        namespace,
        workflow,
        input,
        encoding: $encoding,
        name,
      });
      $refresh = Date.now();
      toaster.push({
        message: translate('workflows.signal-success'),
        id: 'workflow-signal-success-toast',
      });
      hideSignalModal();
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
  id="signal-confirmation-modal"
  data-testid="signal-confirmation-modal"
  bind:error
  bind:open
  {loading}
  confirmText={translate('common.submit')}
  cancelText={translate('common.cancel')}
  confirmDisabled={!name || !encoding}
  on:cancelModal={hideSignalModal}
  on:confirmModal={signal}
>
  <h3 slot="title">{translate('workflows.signal-modal-title')}</h3>
  <div slot="content" class="flex flex-col gap-4">
    <Input
      id="signal-name"
      label={translate('workflows.signal-name-label')}
      required
      bind:value={name}
    />
    <PayloadInput bind:input bind:encoding resetValues={!open} />
  </div>
</Modal>
