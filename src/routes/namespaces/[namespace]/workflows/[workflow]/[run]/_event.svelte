<script lang="ts">
  import { getAttributesFromEvent } from '$lib/utilities/get-attributes-from-event';
  import { getEventClassification } from '$lib/utilities/get-event-classification';
  import { format } from '$lib/utilities/format-camel-case';

  import EventSummary from '$lib/components/event-summary.svelte';
  import EventDetails from '$lib/components/event-details.svelte';
  import EventSummaryAttributes from '$lib/components/event-summary-attributes.svelte';
  import EventLabel from '$lib/components/event-label.svelte';

  export let event: HistoryEventWithId;

  const { attributes } = event;

  const hash = `#event-${event.id}`;
  const summaryEvent = getAttributesFromEvent(event);
</script>

<EventSummary {hash}>
  <div class="flex items-start p-4 mx-4">
    <h2 class="w-1/3 {event.eventType}">
      <EventLabel color={getEventClassification(event)}>
        {format(String(event.eventType))}
      </EventLabel>
    </h2>
    <EventSummaryAttributes attributes={summaryEvent.attributes} />
  </div>
  <EventDetails {attributes} slot="expanded" />
</EventSummary>

<style lang="postcss">
  .label {
    @apply bg-gray-300 px-2 rounded-sm;
  }

  .Scheduled {
    @apply text-gray-700 bg-gray-300;
  }

  .Open,
  .New {
    @apply text-indigo-700 bg-indigo-100;
  }

  .Started,
  .Initiated {
    @apply text-blue-700 bg-blue-100;
  }

  .Running,
  .Completed,
  .Fired {
    @apply text-green-700 bg-green-100;
  }

  .CancelRequested,
  .TimedOut,
  .Signaled,
  .Cancelled {
    @apply text-yellow-700 bg-yellow-100;
  }

  .Failed,
  .Terminated {
    @apply text-red-700 bg-red-100;
  }
</style>
