<script lang="ts">
  import WorkflowPendingActivity from '$lib/components/workflow/pending-activity/workflow-pending-activity.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const pendingActivities = $derived(
    $workflowRun.workflow?.pendingActivities.sort((a, b) => {
      if (isNaN(parseInt(a.activityId)) || isNaN(parseInt(b.activityId))) {
        return a.activityId.localeCompare(b.activityId);
      }
      return parseInt(a.activityId) - parseInt(b.activityId);
    }),
  );
</script>

<div class="pb-16">
  {#if pendingActivities?.length}
    <ul role="list" class="grid grid-cols-1 gap-4">
      {#each pendingActivities as activity (activity.id)}
        <WorkflowPendingActivity {activity} />
      {/each}
    </ul>
  {:else}
    <EmptyState title={translate('workflows.pending-activities-empty-state')} />
  {/if}
</div>
