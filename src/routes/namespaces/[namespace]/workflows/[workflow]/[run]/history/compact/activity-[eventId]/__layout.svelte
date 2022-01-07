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
  import { getContext } from 'svelte';

  import { Activities } from '$lib/models/activity';
  import { routeFor } from '$lib/utilities/route-for';
  import { page } from '$app/stores';

  let events = getContext<EventualHistoryEvents>('events');
  export let params: EventParameter;

  const getActivity = async (
    events: EventualHistoryEvents,
    id: string,
  ): Promise<{ activity: Activity; events: HistoryEventWithId[] }> => {
    const activities = await Activities.fromPromise(events);
    const activity = activities.get(id);

    return {
      activity,
      events: activity.events,
    };
  };

  const getHref = (activity, event: HistoryEventWithId) =>
    routeFor('workflow.events.compact.activity.event', {
      ...params,
      activityId: activity.id,
      eventId: event.id,
    });
</script>

<div class="flex flex-col w-full h-full">
  <nav class="mb-4">
    <ul class="flex gap-4 w-full items-start">
      {#await getActivity(events, params.eventId) then { activity, events }}
        {#each events as event}
          <li>
            <a
              href={getHref(activity, event)}
              class:active={$page.path === getHref(activity, event)}
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
