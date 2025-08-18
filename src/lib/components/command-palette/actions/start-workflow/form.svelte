<script lang="ts">
  import { page } from '$app/state';

  import Message from '$lib/components/form/message.svelte';
  import TaintedBadge from '$lib/components/form/tainted-badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { StartWorkflowAdapter, StartWorkflowFormData } from './types';

  import { defaultAdapter } from './adapter.svelte';
  import { createFormConfig, createFormHandlers } from './config.svelte';

  interface Props {
    class?: string;
    adapter: StartWorkflowAdapter;
    initialAttributes: StartWorkflowFormData;
  }

  let { adapter = defaultAdapter }: Props = $props();

  const initialAttributes = $derived({
    id: page.params.workflow,
  });

  const { superFormInstance } = $derived(
    createFormConfig(adapter, initialAttributes),
  );

  const {
    form,
    errors,
    submitting,
    message,
    enhance,
    tainted,
    isTainted,
    reset,
  } = $derived(superFormInstance);

  const { handleCancel } = $derived(
    createFormHandlers(adapter.onCancel || (() => {}), reset),
  );

  const taintedCount = $derived(
    Object.values($tainted || {}).filter((attr) =>
      Object.values(attr).some((value) => value === true),
    ).length,
  );
</script>

<div class="space-y-6 px-4 py-6">
  <h2>Start Workflow</h2>
  <form use:enhance class="space-y-4">
    <Input
      id="workflow-id"
      label="Workflow Id"
      name="workflowId"
      bind:value={$form.id}
      placeholder=""
      disabled={!!$submitting}
      error={!!$errors.id}
      hintText={$errors.id}
    />
    <Input
      id="task-queue"
      label="Task Queue"
      name="taskQueue"
      bind:value={$form.taskQueue}
      placeholder=""
      disabled={!!$submitting}
      error={!!$errors.taskQueue}
      hintText={$errors.taskQueue}
    />
    <Input
      id="workflow-type"
      label="Workflow Type"
      name="workflowType"
      bind:value={$form.type}
      placeholder=""
      disabled={!!$submitting}
      error={!!$errors.type}
      hintText={$errors.type}
    />

    <Message
      value={$message}
      errors={$errors.name}
      errorsTitle={translate('search-attributes.validation-error-title')}
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button
        type="submit"
        variant="primary"
        disabled={$submitting || !$form.name}
        class="relative"
      >
        {$submitting ? 'Starting' : 'Start'}
        <TaintedBadge show={isTainted($tainted)} count={taintedCount} />
      </Button>

      <Button
        type="button"
        variant="secondary"
        on:click={handleCancel}
        disabled={$submitting}
      >
        {translate('search-attributes.cancel-button')}
      </Button>
    </div>
  </form>
</div>
