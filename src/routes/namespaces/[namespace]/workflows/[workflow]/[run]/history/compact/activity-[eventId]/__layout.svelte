<script context="module" lang="ts">
  import type { EventParameter } from '$lib/utilities/route-for';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page, stuff }: LoadInput) {
    const {
      workflow: workflowId,
      run: runId,
      namespace,
      eventId,
    } = page.params;

    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    return {
      props: {
        events,
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
  import { Activities } from '$lib/models/activity';
  import { routeFor } from '$lib/utilities/route-for';
  import { page } from '$app/stores';

  export let events: HistoryEventWithId[];
  export let params: EventParameter;

  let activities = new Activities(events);
  let activity = activities.get(params.eventId);

  const getHref = (event: HistoryEventWithId) =>
    routeFor('workflow.events.compact.activity.event', {
      ...params,
      activityId: activity.id,
      eventId: event.id,
    });
</script>

<div class="flex flex-col w-full h-full">
  <nav class="mb-4">
    <ul class="flex gap-4 w-full items-start">
      {#each activity.toArray() as event}
        <li>
          <a href={getHref(event)} class:active={$page.path === getHref(event)}>
            {event.eventType}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  <slot />
</div>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
