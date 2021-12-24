<script lang="ts">
  import { page } from '$app/stores';

  import { getEventClassification } from '$lib/utilities/get-event-classification';
  import { format } from '$lib/utilities/format-camel-case';

  import EventLabel from '$lib/components/event-label.svelte';

  export let event: HistoryEventWithId;
  export let href: string;
</script>

<a
  {href}
  sveltekit:noscroll
  sveltekit:prefetch
  class="block border-b-2 border-gray-300"
>
  <article
    class="p-4 border-l-4 border-white"
    class:active={$page.path.includes(href)}
  >
    <h2 class="mb-2 {event.eventType}">
      <EventLabel color={getEventClassification(event)}>
        {format(String(event.eventType))}
      </EventLabel>
    </h2>
    <p>{event.eventTime}</p>
  </article>
</a>

<style lang="postcss">
  .active {
    @apply border-blue-800 bg-blue-100;
  }
</style>
