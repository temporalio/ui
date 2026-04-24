<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PayloadInputEncoding } from '$lib/models/payload-encoding';
  import { Action } from '$lib/models/workflow-actions';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { signalWorkflow } from '$lib/services/workflow-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { toaster } from '$lib/stores/toaster';
  import { triggerRefresh, workflowRun } from '$lib/stores/workflow-run';
  import type {
    WorkflowExecution,
    WorkflowInteractionDefinition,
  } from '$lib/types/workflows';
  import { getIdentity } from '$lib/utilities/core-context';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';

  interface Props {
    workflow: WorkflowExecution;
    namespace: string;
  }

  function sortByName(
    list: WorkflowInteractionDefinition[],
  ): WorkflowInteractionDefinition[] {
    return [...list].sort((a, b) => {
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }

  let { workflow, namespace }: Props = $props();

  const defaultEncoding: PayloadInputEncoding = 'json/plain';
  const identity = getIdentity();

  let coreUser = coreUserStore();

  let input = $state('');
  let name = $state('');
  let customSignal = $state(false);
  let messageType = $state('');
  let error = $state('');
  let loading = $state(false);
  let editorResetKey = $state(0);
  const encoding: Writable<PayloadInputEncoding> = writable(defaultEncoding);

  const metadata = $derived($workflowRun.metadata);
  const signalEnabled = $derived(
    workflowSignalEnabled(page.data.settings, $coreUser, namespace),
  );
  const signalDefinitions = $derived(
    sortByName(metadata?.definition?.signalDefinitions ?? []),
  );
  const hasMultipleSignals = $derived(signalDefinitions.length > 1);
  const selectedSignal = $derived(
    signalDefinitions.find((definition) => definition.name === name),
  );

  const fetchMetadata = async () => {
    const nextMetadata = await getWorkflowMetadata({
      namespace,
      workflow: {
        id: workflow.id,
        runId: workflow.runId,
      },
    });

    $workflowRun.metadata = nextMetadata;
  };

  $effect(() => {
    if (!metadata && workflow.isRunning) {
      void fetchMetadata();
    }
  });

  const getDefaultSignal = () => {
    if (!customSignal && signalDefinitions.length === 1 && !name) {
      name = signalDefinitions[0].name ?? '';
    }

    const promptSignal = signalDefinitions.find((def) =>
      def.name.includes('prompt'),
    );
    if (promptSignal) {
      name = promptSignal.name ?? '';
    } else {
      name = '';
    }
  };

  $effect(() => {
    getDefaultSignal();
  });

  const reset = () => {
    input = '';
    messageType = '';
    error = '';
    customSignal = false;
    editorResetKey += 1;
    $encoding = defaultEncoding;
    getDefaultSignal();
  };

  const handleCustom = () => {
    customSignal = true;
    name = '';
  };

  const sendSignal = async () => {
    error = '';
    loading = true;

    try {
      await signalWorkflow({
        namespace,
        workflow,
        input: JSON.stringify(input),
        encoding: $encoding,
        messageType,
        name,
        identity,
      });

      triggerRefresh(Action.Signal);
      toaster.push({
        message: translate('workflows.signal-success'),
        id: 'workflow-chat-signal-success-toast',
      });
      reset();
    } catch (err) {
      error = isNetworkError(err)
        ? err.message
        : translate('common.unknown-error');
    } finally {
      loading = false;
    }
  };

  const handleInputChange = (text: string): void => {
    if (text !== input) {
      input = text;
    }
  };

  const handleEditorSubmit = (_text: string): void => {
    if (!name || error || loading) {
      return;
    }

    void sendSignal();
  };
</script>

<div>
  {#if !workflow.isRunning && !workflow.isPaused}
    <Card>
      <EmptyState
        icon="signal"
        title={translate('workflows.chat-composer-unavailable')}
        content={translate('workflows.chat-composer-unavailable-description')}
      />
    </Card>
  {:else if !signalEnabled}
    <EmptyState
      icon="signal"
      title={translate('workflows.signal')}
      content={translate('workflows.signal-disabled')}
      class="my-0 border border-subtle py-8"
    />
  {:else}
    <Card class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-base font-medium">
          {translate('workflows.chat-compose-title')}
        </h2>
        <p class="text-sm text-secondary">
          {translate('workflows.chat-compose-description')}
        </p>
      </div>

      {#if hasMultipleSignals && !customSignal}
        <Select
          id="chat-signal-select"
          label={translate('workflows.signal-name-label')}
          class="min-w-fit"
          bind:value={name}
          data-testid="chat-signal-select"
          placeholder="Select a signal"
          required
        >
          <Option
            onclick={handleCustom}
            value="custom"
            description="Input Signal name"
          >
            {translate('common.custom')}
          </Option>
          {#each signalDefinitions as { name: value, description = '' }}
            <Option {value} {description}>{value}</Option>
          {/each}
        </Select>
      {:else if !name || customSignal}
        <Input
          id="chat-signal-name"
          label={translate('workflows.signal-name-label')}
          required
          bind:value={name}
        />
      {:else}
        <div class="flex flex-col gap-1">
          <p
            class="text-xs font-medium uppercase tracking-wider text-secondary"
          >
            {translate('workflows.signal-name-label')}
          </p>
          <p class="font-mono text-sm text-primary">{name}</p>
        </div>
      {/if}

      {#if selectedSignal?.description}
        <p class="text-sm text-secondary">{selectedSignal.description}</p>
      {/if}
      {#key editorResetKey}
        <CodeBlock
          id="signal-input"
          maxHeight={320}
          content={input}
          onchange={handleInputChange}
          onsubmit={handleEditorSubmit}
          editable
          copyable={false}
        />
      {/key}

      {#if error}
        <p class="text-sm text-danger" role="alert">{error}</p>
      {/if}
      <div class="flex items-end justify-end">
        <Button
          trailingIcon="signal"
          on:click={sendSignal}
          disabled={!name || !!error}
          data-testid="send-signal-button"
        >
          Send
        </Button>
      </div>
    </Card>
  {/if}
</div>
