<script lang="ts">
  import { derived, type Readable } from 'svelte/store';

  import { getContext, type Snippet } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { workflowsQuery } from '$lib/stores/workflows';

  interface Props {
    action: Action;
    reason: string;
    jobId: string;
    jobIdPlaceholder: string;
    jobIdValid: boolean;
    children?: Snippet;
  }

  let {
    action,
    reason = $bindable(),
    jobId = $bindable(),
    jobIdPlaceholder,
    jobIdValid = $bindable(),
    children,
  }: Props = $props();

  const {
    allSelected,
    terminableWorkflows,
    cancelableWorkflows,
    selectedWorkflows,
  } = getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  const getActionText = (action: Action): string => {
    switch (action) {
      case Action.Cancel:
        return translate('common.cancel');
      case Action.Terminate:
        return translate('workflows.terminate');
      case Action.Reset:
        return translate('workflows.reset');
      default:
        return '';
    }
  };

  const getOperableWorkflowsCount = (action: Action): Readable<number> => {
    return derived(
      [cancelableWorkflows, terminableWorkflows, selectedWorkflows],
      ([$cancelable, $terminable, $selected]) => {
        switch (action) {
          case Action.Cancel:
            return $cancelable.length;
          case Action.Terminate:
            return $terminable.length;
          case Action.Reset:
            return $selected.length;
          default:
            return 0;
        }
      },
    );
  };

  const actionText = $derived(getActionText(action));
  const operableWorkflowsCount = $derived(getOperableWorkflowsCount(action));

  const handleJobIdChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    jobIdValid = /^[\w.~-]*$/.test(target.value);
  };
</script>

<div class="mb-4 flex flex-col gap-4">
  {#if $allSelected}
    <p class="mb-2">
      <Translate
        key="workflows.batch-operation-confirmation-all"
        replace={{ action: actionText }}
      />
    </p>
    <div
      class="surface-subtle mb-2 overflow-scroll whitespace-nowrap border border-subtle p-2"
    >
      <code data-testid="batch-action-workflows-query">
        {$workflowsQuery}
      </code>
    </div>
    <span class="text-xs">
      <Translate
        key="workflows.batch-operation-count-disclaimer"
        replace={{ action: actionText }}
      />
    </span>
  {:else}
    <p>
      {#if action === Action.Reset}
        <Translate
          key="workflows.batch-reset-confirmation"
          count={$operableWorkflowsCount}
        />
      {:else}
        <Translate
          key="workflows.batch-confirmation"
          replace={{ action: actionText }}
          count={$operableWorkflowsCount}
        />
      {/if}
    </p>
  {/if}
  <Input
    id="bulk-action-reason-{action}"
    bind:value={reason}
    label={translate('common.reason')}
    placeholder={translate('common.reason-placeholder')}
  />
  <Input
    id="batch-operation-job-id"
    label={translate('common.job-id')}
    hintText={jobIdValid
      ? translate('batch.job-id-input-hint')
      : translate('batch.job-id-input-error')}
    bind:value={jobId}
    placeholder={jobIdPlaceholder}
    oninput={handleJobIdChange}
    valid={jobIdValid}
  />
  {@render children?.()}
</div>
