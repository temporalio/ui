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
  export let expandAll: boolean;

  $: {
    console.log('Expand all: ', expandAll);
  }

  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
  $: showClassification =
    isEventGroup(event) && hasGroupEvents && event.lastEvent?.classification;
</script>

<Card
  {event}
  {events}
  {firstEvent}
  {last}
  thick={hasGroupEvents}
  let:expanded
  {expandAll}
>
  <Collapsed {event} expanded={expandAll || expanded} {showClassification} />
  {#if expandAll || expanded}
    <Expanded {event} {events} {firstEvent} />
  {/if}
</Card>
