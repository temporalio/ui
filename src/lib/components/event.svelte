<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCalendar } from '@fortawesome/free-solid-svg-icons';
  import { page } from '$app/stores';

  import type { EventsGroup } from '$lib/models/events-group';

  import { formatEvent } from '$lib/utilities/get-event-classification';
  import { formatDate } from '$lib/utilities/format-date';

  import EventLabel from '$lib/components/event-label.svelte';

  export let event: HistoryEventWithId | PendingActivity | CompactEventGroup;

  let { routeFor, pending, timeStamp, name, tag, classification, id } =
    formatEvent(event);

  let { namespace, workflow: workflowId, run: runId } = $page.params;
  let href = routeFor({ namespace, workflowId, runId });
</script>

<a
  {href}
  sveltekit:noscroll
  sveltekit:prefetch
  class="flex border-b-2 border-gray-300 w-full items-center hover:bg-gray-50"
  class:pending
  class:active={$page.path.includes(href)}
>
  <article class="flex gap-4 items-center p-4">
    <p class="w-5 text-center text-gray-500">{id}</p>
    <div class="w-full">
      <h2 class="mb-2 {tag}">
        <EventLabel color={classification}>
          {name}
        </EventLabel>
      </h2>
      <p class="text-sm">
        <Icon icon={faCalendar} class="inline" />
        {formatDate(timeStamp)}
      </p>
    </div>
    {#if pending}
      <div class="mx-8 text-orange-600 italic">Pending</div>
    {/if}
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

  .pending {
    @apply bg-orange-50;
  }

  .pending .active {
    @apply bg-blue-50;
  }

  a:last-child {
    @apply border-b-0;
  }
</style>
