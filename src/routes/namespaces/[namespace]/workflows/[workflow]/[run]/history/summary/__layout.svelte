<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff, url }) {
    const { events, eventGroups } = stuff;

    const category = url.searchParams.get('category');
    const compact = !!url.searchParams.get('compact');

    return {
      props: {
        events,
        eventGroups,
        category,
        compact,
      },
    };
  };
</script>

<script lang="ts">
  import EmptyState from '$lib/components/empty-state.svelte';
  import Event from '$lib/components/event.svelte';
  import FilterCheckbox from '$lib/components/filter-checkbox.svelte';
  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';

  export let events: HistoryEventWithId[];
  export let eventGroups: CompactEventGroups;

  export let compact = false;
  export let category: EventTypeCategory = null;

  $: eventsForView = compact ? eventGroups : events;
  $: visibleEvents = [...eventsForView].filter(
    (event: HistoryEventWithId | CompactEventGroup) =>
      !category || event.category === category,
  );
</script>

<section class="flex flex-col border-2 border-gray-300 rounded-lg w-full mb-6">
  <div class="flex w-full">
    <header class="table-header border-r-2 rounded-tl-lg w-1/3">
      <h3>Summary</h3>
      <div class="flex items-center gap-4">
        <FilterSelect parameter="category" bind:value={category}>
          <Option value={undefined}>All</Option>
          <Option value="activity">Activity</Option>
          <Option value="command">Command</Option>
          <Option value="signal">Signal</Option>
          <Option value="timer">Timer</Option>
          <Option value="child-workflow">Child Workflow</Option>
          <Option value="workflow">Workflow</Option>
        </FilterSelect>
        <FilterCheckbox
          parameter="compact"
          name="Compact"
          bind:value={compact}
        />
      </div>
    </header>
    <header class="table-header rounded-tr-lg w-2/3">
      <h3>Details</h3>
    </header>
  </div>
  <div class="flex">
    <div class="flex flex-col w-1/3 border-r-2 border-gray-300 rounded-bl-lg">
      <div class="rounded-bl-lg overflow-y-scroll">
        {#each visibleEvents as event (event.id)}
          {#if !category || event.category === category}<Event {event} />{/if}
        {:else}
          <EmptyState
            title="No Events Match"
            content="There are know events that match your filters. Adjust your filters to see your events."
          />
        {/each}
      </div>
    </div>
    <div class="flex flex-col w-2/3">
      <div
        class="overflow-y-scroll overflow-x-hidden rounded-br-lg px-4 w-full py-4"
      >
        <slot />
      </div>
    </div>
  </div>
</section>

<style lang="postcss">
  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 flex justify-between items-center border-b-2;
  }
</style>
