<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const { eventId } = params;

    return {
      props: {
        eventId,
      },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { getGroupForEvent } from '$lib/models/group-events';
  import {
    faBars,
    faCode,
    faLayerGroup,
    faTable,
  } from '@fortawesome/free-solid-svg-icons';

  import type { EventView } from '$lib/utilities/route-for';
  import { importEvents, importEventGroups } from '$lib/stores/import-events';
  import ImportHistory from '$lib/components/event/event-history-import.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import EventFull from '$lib/components/event/event-full.svelte';
  import EventGroupDetails from '$lib/components/event/event-group-details.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let eventId: string;

  let tab: EventView = 'summary';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: filteredEvents = $importEvents.filter((event) => {
    if (category) return event.category === category;
    return event;
  });
  $: filteredEventGroups = $importEventGroups.filter((event) => {
    if (category) return event.category === category;
    return event;
  });

  $: event = filteredEvents.find(
    (event: HistoryEventWithId) => event.id === eventId,
  );

  $: eventGroup = event ? getGroupForEvent(event, $importEventGroups) : null;

  $: activeView = (view: EventView) => tab === view;
</script>

<section class="flex flex-col gap-4">
  <section id="event-history">
    <nav class="relative flex gap-4 justify-between items-end pb-4 max-w-1/2">
      <h3 class="text-lg font-medium">Event History</h3>
      <div class="flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon={faTable}
            active={tab === 'summary'}
            on:click={() => (tab = 'summary')}>Summary</ToggleButton
          >
          <ToggleButton
            icon={faBars}
            active={tab === 'full'}
            on:click={() => (tab = 'full')}>Full</ToggleButton
          >
          <ToggleButton
            icon={faLayerGroup}
            active={tab === 'compact'}
            on:click={() => (tab = 'compact')}>Compact</ToggleButton
          >
          <ToggleButton
            icon={faCode}
            active={tab === 'json'}
            on:click={() => (tab = 'json')}>JSON</ToggleButton
          >
        </ToggleButtons>
        <ImportHistory />
      </div>
    </nav>
    {#if activeView('summary')}
      <EventSummary items={filteredEvents} {category}>
        {#if event}<EventGroupDetails {event} {eventGroup} />{/if}
      </EventSummary>
    {:else if activeView('full')}
      <EventFull events={$importEvents} />
    {:else if activeView('compact')}
      <EventSummary items={filteredEventGroups} {category}>
        {#if event}<EventGroupDetails {event} {eventGroup} />{/if}
      </EventSummary>
    {:else if activeView('json')}
      <CodeBlock content={$importEvents} />
    {/if}
  </section>
</section>
