<script lang="ts">
  import { getContext } from 'svelte';
  import { page } from '$app/stores';

  import { formatEvent } from '$lib/utilities/get-event-classification';

  import EventLabel from '$lib/components/event-label.svelte';

  export let event: HistoryEventWithId | PendingActivity;

  let { id, pending, timeStamp, name, tag, classification } =
    formatEvent(event);

  let path = getContext<string>('path');
  let href = pending ? `${path}/pending-${id}` : `${path}/event-${id}`;
</script>

<a
  {href}
  sveltekit:noscroll
  sveltekit:prefetch
  class="flex border-b-2 border-gray-300 w-full items-center"
  class:pending
  class:active={$page.path.includes(href)}
>
  <article class="p-4 w-full">
    <h2 class="mb-2 {tag}">
      <EventLabel color={classification}>
        {name}
      </EventLabel>
    </h2>
    <p>{timeStamp}</p>
  </article>
  {#if pending}
    <div class="mx-8 text-orange-600 italic">Pending</div>
  {/if}
</a>

<style lang="postcss">
  .active {
    background: theme('colors.blue[100]');
    /* Creates a border without modifying the shape and size of the element. */
    background-image: linear-gradient(
      90deg,
      theme('colors.blue[700]') 0%,
      theme('colors.blue[700]') 1%,
      theme('colors.blue[100]') 1%,
      theme('colors.blue[100]') 1%
    );
  }

  .pending {
    @apply bg-orange-50;
  }

  .pending .active {
    @apply bg-blue-100;
  }
</style>
