<script lang="ts">
  import PendingActivityCard from '$lib/components/workflow/pending-activity/pending-activity-card.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

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
        />
      {/each}
    </div>
  {:else}
    <EmptyState title={translate('workflows.pending-activities-empty-state')} />
  {/if}
</div>
