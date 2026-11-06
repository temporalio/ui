<script lang="ts">
  import ActivityCommands from '$lib/components/activity/activity-commands.svelte';
  import PendingActivityCard from '$lib/components/workflow/pending-activity/pending-activity-card.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import { triggerRefresh, workflowRun } from '$lib/stores/workflow-run';

  const historyController = getWorkflowHistoryController();
  const workflow = $derived($workflowRun.workflow);

  const pendingActivities = $derived(
    $workflowRun.workflow?.pendingActivities?.sort((a, b) => {
      if (isNaN(parseInt(a.activityId)) || isNaN(parseInt(b.activityId))) {
        return a.activityId.localeCompare(b.activityId);
      }
      return parseInt(a.activityId) - parseInt(b.activityId);
    }) || [],
  );
</script>

<div class="pb-16">
  {#if pendingActivities.length}
    <div class="flex flex-col gap-4">
      {#each pendingActivities as activity (activity.id)}
        <PendingActivityCard
          {activity}
          totalPending={pendingActivities.length}
          scheduledEvent={historyController.history.pendingActivityScheduledEvent(
            activity.activityId,
          )}
        >
          {#snippet actions(actionActivity)}
            {#if workflow}
              <ActivityCommands
                activity={actionActivity}
                workflowExecutionIdentity={historyController.workflowExecutionIdentity}
                {workflow}
                onRefresh={triggerRefresh}
                class="justify-end"
              />
            {/if}
          {/snippet}
        </PendingActivityCard>
      {/each}
    </div>
  {:else}
    <EmptyState title={translate('workflows.pending-activities-empty-state')} />
  {/if}
</div>
