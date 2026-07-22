<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/standalone-activities.svelte';
  import { activitiesQuery, activityCount } from '$lib/stores/activities';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { standaloneActivityBulkActionsEnabled } from '$lib/utilities/standalone-activities-commands-disabled';

  type Props = {
    activities: ActivityExecutionInfo[];
  };

  let { activities }: Props = $props();

  const {
    selectedActivities,
    allSelected,
    handleSelectAll,
    cancelableActivities,
    terminableActivities,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
  } = getContext<ActivityBatchOperationContext>(
    ACTIVITY_BATCH_OPERATION_CONTEXT,
  );

  const selectedActivitiesCount = $derived($selectedActivities?.length ?? 0);
  const actionsEnabled = $derived(standaloneActivityBulkActionsEnabled(page));
</script>

{#if $allSelected}
  <span class="font-medium">
    <Translate
      key="standalone-activities.all-selected"
      count={$activityCount.count}
    />
  </span>
{:else}
  <span class="font-medium"
    ><Translate
      key="standalone-activities.n-selected"
      count={selectedActivitiesCount}
    /></span
  >
  {#if $activitiesQuery}
    <span>
      ({translate('standalone-activities.select-all-leading')}
      <button
        data-testid="select-all-activities"
        onclick={() => handleSelectAll(activities)}
        class="cursor-pointer underline"
        ><Translate
          key="standalone-activities.select-all"
          count={$activityCount.count}
        /></button
      >
      {translate('standalone-activities.select-all-trailing')})
    </span>
  {/if}
{/if}
<div class="ml-4 inline-flex gap-2">
  {#if actionsEnabled}
    <Button
      size="xs"
      variant="ghost"
      class="focus-visible:border-table"
      data-testid="bulk-cancel-button"
      disabled={!$cancelableActivities.length}
      on:click={openBatchCancelConfirmationModal}
      >{translate('standalone-activities.request-cancellation')}</Button
    >
    <Button
      size="xs"
      variant="destructive"
      class="focus-visible:border-table"
      data-testid="bulk-terminate-button"
      disabled={!$terminableActivities.length}
      on:click={openBatchTerminateConfirmationModal}
      >{translate('standalone-activities.terminate')}</Button
    >
  {/if}
</div>
