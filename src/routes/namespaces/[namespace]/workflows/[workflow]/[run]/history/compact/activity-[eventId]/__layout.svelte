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

    const { eventGroups } = stuff;
    const group = eventGroups.find(({ id }) => id === eventId);

    if (!group) return { status: 404 };

    const events = [...group.events.values()];

    return {
      props: {
        group,
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
  import { routeFor } from '$lib/utilities/route-for';
  import { page } from '$app/stores';

  export let group: CompactEventGroup;
  export let events: HistoryEventWithId[];
  export let params: EventParameter;

  const getHref = (
    group: CompactEventGroup,
    event: HistoryEventWithId,
  ): string =>
    routeFor('workflow.events.compact.activity.event', {
      ...params,
      activityId: group.id,
      eventId: event.id,
    });
</script>

<div class="flex flex-col w-full h-full">
  <nav class="mb-4">
    <ul class="flex gap-4 w-full items-start">
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
    </ul>
  </nav>
  <slot />
</div>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
