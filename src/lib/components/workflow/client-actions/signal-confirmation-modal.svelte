<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import PayloadInputWithEncoding, {
    type PayloadInputEncoding,
  } from '$lib/components/payload-input-with-encoding.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { signalWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let open: boolean;
  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let refresh: Writable<number>;

  $: ({ metadata } = $workflowRun);
  $: signalDefinitions = metadata?.definition?.signalDefinitions;

  const defaultEncoding: PayloadInputEncoding = 'json/plain';

  let error: string = '';
  let loading = false;
  let name = '';
  let customSignal = false;

  let encoding: Writable<PayloadInputEncoding> = writable(defaultEncoding);
  let input = '';

  const hideSignalModal = () => {
    open = false;
    name = '';
    input = '';
    customSignal = false;
    $encoding = defaultEncoding;
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

  const handleCustom = () => {
    customSignal = true;
    name = '';
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
    {#if signalDefinitions?.length > 0 && !customSignal}
      <Select
        id="signal-select"
        label={translate('workflows.signal-name-label')}
        class="min-w-fit"
        bind:value={name}
        data-testid="signal-select"
        placeholder="Select a signal"
        required
      >
        {#each signalDefinitions as { name: value, description = '' }}
          <Option {value} {description}>{value}</Option>
        {/each}
        <Option
          on:click={handleCustom}
          value="custom"
          description="Input Signal name">Custom</Option
        >
      </Select>
    {:else}
      <Input
        id="signal-name"
        label={translate('workflows.signal-name-label')}
        required
        bind:value={name}
      />
    {/if}
    <PayloadInputWithEncoding bind:input bind:encoding />
  </div>
</Modal>
