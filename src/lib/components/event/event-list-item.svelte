<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCalendar } from '@fortawesome/free-solid-svg-icons';

  import { page } from '$app/stores';
  import { isEvent } from '$lib/models/event-history';
  import { isEventGroup } from '$lib/models/group-events';
  import EventClassification from './event-classification.svelte';

  export let event: IterableEvent;

  const isActive = (currentId: string): boolean => {
    if (isEvent(event)) {
      return event.id === currentId;
    }

    if (isEventGroup(event)) {
      return event.eventIds.has(currentId);
    }
  };
</script>

<a
  href={event.id + $page.url.search}
  sveltekit:noscroll
  id={event.id}
  class="flex border-b-2 border-gray-300 w-full items-center hover:bg-gray-50"
  class:active={isActive($page.params.eventId)}
>
  <article class="flex gap-4 items-center p-4 w-full">
    <p class="w-5 text-center text-gray-500">{event.id}</p>
    <div class="w-full">
      <h2 class="mb-2">
        <EventClassification {event} />
      </h2>
      <p class="text-sm">
        <Icon icon={faCalendar} class="inline" />
        {event.timestamp}
      </p>
    </div>
  </article>
</a>

<style lang="postcss">
  .active {
    background: theme('colors.blue[50]');
    /* Creates a border without modifying the shape and size of the element. */
    background-image: linear-gradient(
      90deg,
      theme('colors.blue[700]') 0%,
      theme('colors.blue[700]') 1%,
      theme('colors.blue[50]') 1%,
      theme('colors.blue[50]') 1%
    );
  }

  a:last-child {
    @apply border-b-0;
  }
</style>
