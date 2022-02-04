<script lang="ts">
  import { page } from '$app/stores';

  import EventDetails from '$lib/components/event-details.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  const findEvent = async (
    data: EventualHistoryEvents,
    id: string,
  ): Promise<HistoryEventWithId> => {
    return data.then((events) => events.find((event) => event.id === id));
  };

  let events = getAppContext('events');
  $: event = findEvent(events, $page.params.id);
</script>

{#await event then { attributes }}
  <EventDetails {attributes} />
{/await}
