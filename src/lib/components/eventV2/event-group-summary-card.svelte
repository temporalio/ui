<script lang="ts">
  import { isEventGroup } from '$lib/models/event-groups';
  import PendingActivityCard from './pending-activity-card.svelte';
  import Collapsed from './event-summary-card/collapsed.svelte';
  import Expanded from './event-summary-card/expanded.svelte';
  import Card from './event-summary-card/card.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined;
  export let last = false;

  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
  $: pendingActivity = isEventGroup(event) && event?.pendingActivity;
  $: showClassification =
    isEventGroup(event) && hasGroupEvents && event.lastEvent?.classification;
</script>

{#if pendingActivity}
  <PendingActivityCard event={pendingActivity} />
{/if}
<Card {event} {events} {firstEvent} {last} thick={hasGroupEvents} let:expanded>
  <Collapsed {event} {events} {firstEvent} {expanded} {showClassification} />
  {#if expanded}
    <Expanded {event} {events} {firstEvent} />
  {/if}
</Card>
