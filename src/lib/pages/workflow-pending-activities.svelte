<script lang="ts">
  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities ?? []);

  const pendingGroups = $derived.by(() => {
    const groups = groupEvents(
      $fullEventHistory,
      'ascending',
      pendingActivities,
    );
    return groups.filter((g) => g.pendingActivity);
  });
</script>

<div class="pb-16">
  {#if pendingGroups.length}
    <div class="flex flex-col gap-4">
      {#each pendingGroups as group (group.id)}
        <EventDetailsFull {group} />
      {/each}
    </div>
  {:else}
    <EmptyState title={translate('workflows.pending-activities-empty-state')} />
  {/if}
</div>
