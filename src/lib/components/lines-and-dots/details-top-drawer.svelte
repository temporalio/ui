<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';

  import EventDetailsHeader from './event-details-header.svelte';
  import EventDetails from './event-details.svelte';
  import PendingDetails from './pending-details.svelte';

  export let activeEvent: WorkflowEvent | undefined = undefined;
  export let activeGroup: EventGroup | undefined = undefined;
</script>

<div class="flex h-48 flex-col gap-0 overflow-auto bg-slate-800">
  {#if activeGroup}
    {#if activeGroup?.pendingActivity}
      <EventDetailsHeader text="Pending" />
      <PendingDetails pendingActivity={activeGroup.pendingActivity} />
    {/if}
    {#each activeGroup.eventList.reverse() as event}
      <EventDetailsHeader text={`${event.id} ${event.name}`} />
      <EventDetails {event} />
    {/each}
  {:else if activeEvent}
    <EventDetailsHeader text={`${activeEvent.id} ${activeEvent.name}`} />
    <EventDetails event={activeEvent} />
  {/if}
</div>
