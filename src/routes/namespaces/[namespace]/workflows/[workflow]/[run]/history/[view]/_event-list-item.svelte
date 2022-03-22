<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCalendar } from '@fortawesome/free-solid-svg-icons';

  import { page } from '$app/stores';
  import { isEvent } from '$lib/models/event-history';
  import { isEventGroup } from '$lib/models/group-events';

  export let event: HistoryEventWithId | CompactEventGroup;

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
  class="flex border-b-2 border-gray-300 w-full items-center hover:bg-gray-50"
  class:active={isActive($page.params.eventId)}
>
  <article class="flex gap-4 items-center p-4 w-full">
    <p class="w-5 text-center text-gray-500">{event.id}</p>
    <div class="w-full">
      <h2 class="mb-2">
        <span class="label {event.classification} font-semibold">
          {event.name}
        </span>
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

  .label {
    @apply px-2 text-gray-700 bg-gray-300;
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
