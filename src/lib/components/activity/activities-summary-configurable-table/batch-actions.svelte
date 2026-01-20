<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
  } from '$lib/pages/activities-with-search.svelte';
  import { activitiesQuery, activityCount } from '$lib/stores/activities';
  import { coreUserStore } from '$lib/stores/core-user';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';

  interface Props {
    activities: ActivityExecutionInfo[];
  }

  let { activities }: Props = $props();

  const {
    selectedActivities,
    allSelected,
    handleSelectAll,
    cancelableActivities,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
  } = getContext<ActivityBatchOperationContext>(
    ACTIVITY_BATCH_OPERATION_CONTEXT,
  );

  let coreUser = coreUserStore();

  const selectedActivitiesCount = $derived($selectedActivities?.length ?? 0);

  const terminateEnabled = $derived(
    workflowTerminateEnabled(
      page.data.settings,
      $coreUser,
      page.params.namespace,
    ),
  );

  const cancelEnabled = $derived(
    workflowCancelEnabled(page.data.settings, $coreUser, page.params.namespace),
  );
</script>

{#if $allSelected}
  <span class="font-medium">
    <Translate key="activities.all-selected" count={$activityCount.count} />
  </span>
{:else}
  <span class="font-medium"
    ><Translate
      key="activities.n-selected"
      count={selectedActivitiesCount}
    /></span
  >
  {#if $activitiesQuery}
    <span>
      ({translate('activities.select-all-leading')}
      <button
        data-testid="select-all-activities"
        onclick={() => handleSelectAll(activities)}
        class="cursor-pointer underline"
        ><Translate
          key="activities.select-all"
          count={$activityCount.count}
        /></button
      >
      {translate('activities.select-all-trailing')})
    </span>
  {/if}
{/if}
<div class="ml-4 inline-flex gap-2">
  {#if cancelEnabled}
    <Button
      size="xs"
      variant="ghost"
      class="focus-visible:border-table"
      data-testid="activity-bulk-cancel-button"
      disabled={!$cancelableActivities.length}
      on:click={openBatchCancelConfirmationModal}
      >{translate('workflows.request-cancellation')}</Button
    >
  {/if}
  {#if terminateEnabled}
    <Button
      size="xs"
      variant="destructive"
      class="focus-visible:border-table"
      data-testid="activity-bulk-terminate-button"
      on:click={openBatchTerminateConfirmationModal}
      >{translate('workflows.terminate')}</Button
    >
  {/if}
</div>
