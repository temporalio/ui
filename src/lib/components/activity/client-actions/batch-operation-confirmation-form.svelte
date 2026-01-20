<script lang="ts">
  import { derived, type Readable } from 'svelte/store';

  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { Action } from '$lib/models/workflow-actions';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/activities-with-search.svelte';
  import { activitiesQuery } from '$lib/stores/activities';

  interface Props {
    action: Action;
    reason: string;
    jobId: string;
    reasonPlaceholder: string;
    jobIdPlaceholder: string;
    jobIdValid: boolean;
    children?: Snippet;
  }

  let {
    action,
    reason = $bindable(),
    jobId = $bindable(),
    reasonPlaceholder,
    jobIdPlaceholder,
    jobIdValid = $bindable(),
    children,
  }: Props = $props();

  const {
    allSelected,
    terminableActivities,
    cancelableActivities,
    selectedActivities,
  } = getContext<ActivityBatchOperationContext>(
    ACTIVITY_BATCH_OPERATION_CONTEXT,
  );

  const getActionText = (action: Action): string => {
    switch (action) {
      case Action.Cancel:
        return translate('common.cancel');
      case Action.Terminate:
        return translate('workflows.terminate');
      default:
        return '';
    }
  };

  const getOperableActivitiesCount = (action: Action): Readable<number> => {
    return derived(
      [cancelableActivities, terminableActivities, selectedActivities],
      ([$cancelable, $terminable, $selected]) => {
        switch (action) {
          case Action.Cancel:
            return $cancelable.length;
          case Action.Terminate:
            return $terminable.length;
          default:
            return $selected.length;
        }
      },
    );
  };

  const actionText = $derived(getActionText(action));
  const operableActivitiesCount = $derived(getOperableActivitiesCount(action));

  const handleJobIdChange = (
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) => {
    jobIdValid = /^[\w.~-]*$/.test(event.currentTarget.value);
  };
</script>

<div class="mb-4 flex flex-col gap-4">
  {#if $allSelected}
    <p class="mb-2">
      <Translate
        key="activities.batch-operation-confirmation-all"
        replace={{ action: actionText }}
      />
    </p>
    <div
      class="surface-subtle mb-2 overflow-scroll whitespace-nowrap border border-subtle p-2"
    >
      <code data-testid="batch-action-activities-query">
        {$activitiesQuery}
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
      {#if action === Action.Cancel}
        <Translate
          key="activities.batch-cancel-confirmation"
          count={$operableActivitiesCount}
        />
      {:else if action === Action.Terminate}
        <Translate
          key="activities.batch-terminate-confirmation"
          count={$operableActivitiesCount}
        />
      {/if}
    </p>
  {/if}
  <Input
    id="activity-bulk-action-reason-{action}"
    bind:value={reason}
    label={translate('common.reason')}
    hintText={translate('workflows.batch-operation-confirmation-input-hint', {
      placeholder: reasonPlaceholder,
    })}
    placeholder={reasonPlaceholder}
  />
  <Input
    id="activity-batch-operation-job-id"
    label={translate('common.job-id')}
    hintText={jobIdValid
      ? translate('batch.job-id-input-hint')
      : translate('batch.job-id-input-error')}
    bind:value={jobId}
    placeholder={jobIdPlaceholder}
    on:input={handleJobIdChange}
    valid={jobIdValid}
  />
  {@render children?.()}
</div>
