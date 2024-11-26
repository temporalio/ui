<script lang="ts">
  import { page } from '$app/stores';

  import Link from '$lib/holocene/link.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';

  export let eventGroup: EventGroup;
  export let selectedId: string;
  export let onGroupClick: (id: string) => void;

  $: ({ workflow, run, namespace } = $page.params);
</script>

<div class="w-full border-slate-700 lg:w-1/3 lg:border-r">
  <Table class="surface-primary w-full table-fixed pb-2" variant="simple">
    {#each [...eventGroup.events].reverse() as [id, eventInGroup] (id)}
      <tr
        class="row dense"
        class:active={id === selectedId}
        class:failure={eventOrGroupIsFailureOrTimedOut(eventInGroup)}
        class:canceled={eventOrGroupIsCanceled(eventInGroup)}
        class:terminated={eventOrGroupIsTerminated(eventInGroup)}
        on:click|preventDefault|stopPropagation={() => onGroupClick(id)}
      >
        <td class="w-20">
          <p class="truncate text-sm text-slate-500 md:text-base">
            <Link
              class="truncate"
              href={routeForEventHistoryEvent({
                eventId: id,
                namespace,
                workflow,
                run,
              })}
            >
              {id}
            </Link>
          </p>
        </td>
        <td>
          <p class="event-type truncate text-sm md:text-base">
            {isLocalActivityMarkerEvent(eventInGroup)
              ? 'LocalActivity'
              : eventInGroup.eventType}
          </p>
        </td>
        <td />
      </tr>
    {/each}
  </Table>
</div>

<style lang="postcss">
  .row:hover {
    @apply cursor-pointer bg-interactive-table-hover bg-fixed;
  }

  .active {
    @apply bg-interactive-table-hover;
  }

  .failure {
    @apply bg-red-50;
  }

  .failure .event-type {
    @apply text-red-700;
  }

  .canceled {
    @apply bg-yellow-50;
  }

  .canceled .event-type {
    @apply text-yellow-700;
  }

  .terminated {
    @apply bg-pink-50;
  }

  .terminated .event-type {
    @apply text-pink-700;
  }

  .failure:hover,
  .active.canceled {
    @apply bg-gradient-to-br from-red-100 to-red-200 bg-fixed;
  }

  .canceled:hover,
  .active.canceled {
    @apply bg-gradient-to-br from-yellow-100 to-yellow-200 bg-fixed;
  }

  .terminated:hover,
  .active.terminated {
    @apply bg-gradient-to-br from-pink-100 to-pink-200 bg-fixed;
  }
</style>
