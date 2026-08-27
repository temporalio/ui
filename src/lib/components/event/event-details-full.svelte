<script lang="ts">
  import type { BadgeSize } from '$lib/holocene/badge.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';

  import EventCard from './event-card.svelte';

  let {
    group = undefined,
    event = undefined,
    lazy = false,
    size,
  }: {
    group?: EventGroup;
    event?: WorkflowEvent;
    lazy?: boolean;
    size?: BadgeSize;
  } = $props();

  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );
  const showEventGroup = $derived(
    group && (group.eventList.length > 1 || pendingEvent),
  );
</script>

{#if showEventGroup}
  <div class="flex flex-col overflow-hidden">
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} {size} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard
        operation={group.pendingNexusOperation}
        {size}
      />
    {/if}
    {#each group?.eventList ?? [] as groupEvent}
      <EventCard event={groupEvent} {lazy} />
    {/each}
  </div>
{:else if event}
  <EventCard {event} {lazy} />
{/if}
