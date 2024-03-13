<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  import { v4 } from 'uuid';

  import { getPlacholder } from '$lib/utilities/workflow-actions';

  export const batchOperationForm = (
    action: Action,
    email: string | undefined,
  ) => ({
    reason: writable(''),
    reasonPlaceholder: getPlacholder(action, email),
    jobId: writable(''),
    jobIdPlaceholder: v4(),
    jobIdValid: writable(true),
  });
</script>

<script lang="ts">
  import { getContext } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';

  export let action: Action;
  export let reason: string;
  export let jobId: string;
  export let reasonPlaceholder: string;
  export let jobIdPlaceholder: string;
  export let jobIdValid: boolean;

  const { allSelected, query, terminableWorkflows, cancelableWorkflows } =
    getContext<BatchOperationContext>(BATCH_OPERATION_CONTEXT);

  $: actionText =
    action === Action.Cancel
      ? translate('common.cancel')
      : translate('workflows.terminate');
  $: operableWorkflowsCount =
    action === Action.Terminate
      ? $terminableWorkflows.length
      : $cancelableWorkflows.length;

  const handleJobIdChange = (event: Event & { target: HTMLInputElement }) => {
    jobIdValid = /^[\w.~-]*$/.test(event.target.value);
  };
</script>

<div class="mb-4 flex flex-col gap-2">
  {#if $allSelected}
    <p class="mb-2">
      <Translate
        key="workflows.batch-operation-confirmation-all"
        replace={{ action: actionText }}
      />
    </p>
    <div
      class="mb-2 overflow-scroll whitespace-nowrap rounded border border-primary bg-badge p-2"
    >
      <code data-testid="batch-action-workflows-query">
        {$query}
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
      <Translate
        key={action === Action.Cancel
          ? 'workflows.batch-cancel-confirmation'
          : 'workflows.batch-terminate-confirmation'}
        count={operableWorkflowsCount}
      />
    </p>
  {/if}
  <Input
    id="bulk-action-reason-{action}"
    bind:value={reason}
    label={translate('common.reason')}
    hintText={translate('workflows.batch-operation-confirmation-input-hint', {
      placeholder: reasonPlaceholder,
    })}
    placeholder={reasonPlaceholder}
  />
  <Input
    id="batch-operation-job-id"
    label={translate('common.job-id')}
    hintText={jobIdValid
      ? translate('batch.job-id-input-hint')
      : translate('batch.job-id-input-error')}
    bind:value={jobId}
    placeholder={jobIdPlaceholder}
    on:input={handleJobIdChange}
    valid={jobIdValid}
  />
</div>
