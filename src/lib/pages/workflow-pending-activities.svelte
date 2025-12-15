<script lang="ts">
  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowHistoryInformation } from '$lib/runes/workflow-history-information.svelte';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { groups } = $derived(
    workflowHistoryInformation(
      $workflowRun.workflow,
      $fullEventHistory,
      $eventFilterSort,
    ),
  );

  const pendingActivityGroups = $derived(
    groups.filter((group) => !!group.pendingActivity),
  );
</script>

<div class="pb-16">
  {#each pendingActivityGroups as group}
    <EventDetailsFull {group} />
  {:else}
    <EmptyState title={translate('workflows.pending-activities-empty-state')} />
  {/each}
</div>
