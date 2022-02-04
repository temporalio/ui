<script context="module" lang="ts">
  import type { EventParameter } from '$lib/utilities/route-for';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const {
      workflow: workflowId,
      run: runId,
      namespace,
      eventId,
    } = page.params;

    return {
      props: {
        params: {
          workflowId,
          runId,
          namespace,
          eventId,
        },
      },
    };
  }
</script>

<script lang="ts">
  import { EventGroups, EventsGroup } from '$lib/models/events-group';
  import { routeFor } from '$lib/utilities/route-for';
  import { page } from '$app/stores';
  import { getAppContext } from '$lib/utilities/get-context';

  let events = getAppContext('events');
  export let params: EventParameter;

  const getEventsGroup = async (
    events: EventualHistoryEvents,
    id: string,
  ): Promise<{ group: EventsGroup; events: HistoryEventWithId[] }> => {
    const groups = await EventGroups.fromPromise(events);
    const group = groups.get(id);

    return {
      group,
      events: group.events,
    };
  };

  const getHref = (group: EventsGroup, event: HistoryEventWithId): string =>
    routeFor('workflow.events.compact.activity.event', {
      ...params,
      activityId: group.id,
      eventId: event.id,
    });
</script>

<div class="flex flex-col w-full h-full">
  <nav class="mb-4">
    <ul class="flex gap-4 w-full items-start">
      {#await getEventsGroup(events, params.eventId) then { group, events }}
        {#each events as event}
          <li>
            <a
              href={getHref(group, event)}
              class:active={$page.path === getHref(group, event)}
            >
              {event.eventType}
            </a>
          </li>
        {/each}
      {/await}
    </ul>
  </nav>
  <slot />
</div>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
