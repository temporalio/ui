<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import { getGroupForEvent } from '$lib/models/group-events';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import type { EventHistoryParameters } from '$lib/utilities/route-for';

  const shouldRedirect = (
    event: HistoryEventWithId,
    eventGroup: CompactEventGroup,
    { matchingEvents }: Partial<App.Stuff>,
    { view }: Record<string, string>,
  ): boolean => {
    if (!matchingEvents.includes(event)) return true;
    if (view === 'compact' && !eventGroup) return true;
    return false;
  };

  export const load: Load = async function ({ params, stuff, url }) {
    const { eventId } = params;
    const { events, eventGroups } = stuff;

    const event: HistoryEventWithId = events.find(
      (event: HistoryEventWithId) => event.id === eventId,
    );

    const eventGroup: CompactEventGroup = getGroupForEvent(event, eventGroups);

    if (!event) return { status: 404 };

    if (shouldRedirect(event, eventGroup, stuff, params)) {
      url.pathname = routeForEventHistory(params as EventHistoryParameters);

      return {
        status: 302,
        redirect: String(url),
      };
    }

    return {
      props: { event, eventGroup },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { format } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/components/code-block.svelte';
  import { appendQueryParameters } from '$lib/utilities/append-query-parameters';

  export let event: HistoryEventWithId;
  export let eventGroup: CompactEventGroup;

  const shouldDisplay = (key: string, value: unknown): boolean => {
    if (value === null) return false;
    if (value === undefined) return false;
    if (value === '') return false;
    if (value === '0s') return false;
    if (key === 'type') return false;
    return true;
  };
</script>

<section class="overflow-y-scroll max-h-full">
  {#if eventGroup}
    <nav class="flex flex-col mb-4">
      <ul class="flex gap-4 w-full items-start">
        {#each [...eventGroup.events] as [id, eventInGroup]}
          <li>
            <a
              sveltekit:noscroll
              href={appendQueryParameters(id, $page.url.searchParams)}
              class:active={id === event.id}
              class="border-b-2 border-blue-600"
            >
              {eventInGroup.eventType}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}

  {#each Object.entries(event.attributes) as [key, value] (key)}
    {#if shouldDisplay(key, value)}
      <article
        class="flex items-center content-start w-full border-b-2 last:border-b-0 border-gray-200 py-1"
      >
        <h4 class="w-96 flex-grow">{format(key)}</h4>
        <div class="flex-grow w-full">
          {#if typeof value === 'object'}
            <CodeBlock content={value} />
          {:else}
            <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
          {/if}
        </div>
      </article>
    {/if}
  {/each}
</section>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
