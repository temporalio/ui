<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { page } from '$app/state';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import PayloadInput from '$lib/components/payload-input.svelte';
  import RandomUuidButton from '$lib/components/random-uuid-button.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { type PayloadInputEncoding } from '$lib/models/payload-encoding';
  import { updateWorkflow } from '$lib/services/workflow-service';
  import { toaster } from '$lib/stores/toaster';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { UpdateWorkflowResponse } from '$lib/types';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  interface Props {
    open: boolean;
    workflow: WorkflowExecution;
    namespace: string;
  }

  let { open = $bindable(), workflow, namespace }: Props = $props();

  const runId = $derived(page.params.run);
  const metadata = $derived($workflowRun.metadata);
  const updateDefinitions = $derived(metadata?.definition?.updateDefinitions);

  const defaultEncoding: PayloadInputEncoding = 'json/plain';

  let error = $state('');
  let loading = $state(false);
  let failure = $state<
    NonNullable<UpdateWorkflowResponse['outcome']>['failure'] | undefined
  >(undefined);
  let success = $state<
    | NonNullable<UpdateWorkflowResponse['outcome']>['success']
    | boolean
    | undefined
  >(undefined);

  let name = $state('');
  let updateId = $state('');
  let input = $state('');
  let customUpdate = $state(false);
  let encoding: Writable<PayloadInputEncoding> = writable(defaultEncoding);

  const hideModal = () => {
    open = false;
    name = '';
    updateId = '';
    input = '';
    customUpdate = false;
    $encoding = defaultEncoding;
    failure = undefined;
    success = undefined;
  };

  const update = async () => {
    failure = undefined;
    success = undefined;
    error = '';
    loading = true;

    try {
      const result = await updateWorkflow({
        namespace,
        workflow: { workflowId: workflow.id, runId },
        input,
        updateId,
        encoding: $encoding,
        name,
      });

      failure = result?.outcome?.failure;
      success = result?.outcome?.success || !failure;
      updateId = '';

      if (success) {
        toaster.push({
          message: translate('workflows.update-success'),
          variant: 'success',
        });
        hideModal();
      }
    } catch (err) {
      error = isNetworkError(err)
        ? (err.message ?? translate('common.unknown-error'))
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };

  const handleCustom = () => {
    customUpdate = true;
    name = '';
  };
</script>

<Modal
  id="update-confirmation-modal"
  data-testid="update-confirmation-modal"
  large
  bind:error
  bind:open
  {loading}
  confirmText={translate('common.submit')}
  cancelText={translate('common.cancel')}
  confirmDisabled={!name || !encoding}
  on:cancelModal={hideModal}
  on:confirmModal={update}
>
  <h3 slot="title">{translate('workflows.update-modal-title')}</h3>
  <div class="flex flex-col gap-4" slot="content">
    {#if (updateDefinitions?.length ?? 0) > 0 && !customUpdate}
      <Select
        id="update-select"
        label={translate('common.name')}
        class="min-w-fit"
        bind:value={name}
        data-testid="update-select"
        placeholder="Select an Update"
        required
        disabled={loading}
      >
        {#each updateDefinitions as { name: value, description = '' } (value)}
          <Option {value} {description}>{value}</Option>
        {/each}
        <Option onclick={handleCustom} value="custom">Custom</Option>
      </Select>
    {:else}
      <div class="flex w-full items-end justify-between gap-2">
        <Input
          id="update-name"
          class="w-full"
          label={translate('common.name')}
          required
          bind:value={name}
          disabled={loading}
        />
        {#if customUpdate}
          <Button
            on:click={() => {
              customUpdate = false;
              name = '';
            }}
            variant="secondary"
            leadingIcon="close"
            disabled={loading}
          />
        {/if}
      </div>
    {/if}
    <Input
      id="update-id"
      label={translate('workflows.update-id')}
      bind:value={updateId}
      disabled={loading}
    >
      {#snippet afterInput()}
        <RandomUuidButton
          class="ml-2.5"
          bind:value={updateId}
          disabled={loading}
        />
      {/snippet}
    </Input>
    <PayloadInput bind:input />
    {#if loading}
      <Alert intent="info" title="In Progress"
        >{translate('workflows.update-in-progress')}</Alert
      >
    {/if}
    {#if failure}
      <Alert intent="error" title={failure?.message || 'Failure'}>
        {#if failure?.stackTrace}
          <CodeBlock
            class="mt-4"
            content={failure.stackTrace}
            label={translate('common.stack-trace')}
            language="text"
          />
        {/if}
      </Alert>
    {/if}
    {#if success && typeof success === 'object'}
      <Alert intent="success" title="Success">
        {#if success?.payloads?.[0] && success.payloads[0].data}
          <PayloadCodeBlock
            value={success}
            label={translate('workflows.update-result')}
          />
        {/if}
      </Alert>
    {/if}
  </div>
</Modal>
