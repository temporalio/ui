<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import EventDetails from './event-details.svelte';
  import EventSingleDetail from './event-single-detail.svelte';

  export let event: HistoryEventWithId;
  export let expanded: boolean = false;

  $: collapsed = expanded ? false : true;

  const onLinkClick = () => {
    if (!expanded) {
      collapsed = !collapsed;
    }
  };
</script>

<article class="row" id={event.id}>
  <div class="cell">
    <span class="text-gray-500 text-normal mx-1">{event.id}</span>
    <span
      class="mx-2"
      class:link={!expanded}
      on:click|stopPropagation={onLinkClick}>{event.name}</span
    >
  </div>
  <div class="cell links font-medium md:font-normal">
    {formatDate(event?.eventTime)}
  </div>
  <div class="cell links">
    {#if collapsed}
      <EventSingleDetail {event} />
    {:else}
      <EventDetails {event} />
    {/if}
  </div>
</article>

<style lang="postcss">
  .cell {
    @apply md:table-cell md:border-b-2 text-left p-1 pt-2;
  }

  .row {
    @apply no-underline p-1 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .link {
    @apply text-gray-900 cursor-pointer;
  }

  .row:hover .link {
    @apply text-blue-700 border-b-2 border-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
