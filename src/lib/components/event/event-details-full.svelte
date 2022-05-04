<script lang="ts">
  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';
  import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';
  import WorkflowStatus from '../workflow-status.svelte';

  import {
    formatAttributes,
    AttributeGroup,
    attributeGroups,
  } from './_format-attributes';
  import EventDetailPills from './event-detail-pills.svelte';

  export let event: IterableEvent;
  export let compact = false;
  export let eventGroup: EventGroup | null;
  export let selectedId: string;

  $: attributes = formatAttributes(event, { compact });
  $: attributeGrouping = attributeGroups(attributes);

  let activePill: AttributeGroup = 'summary';

  $: {
    if (!attributeGrouping[activePill]) {
      activePill = 'summary';
    }
  }

  const handlePillChange = (event: CustomEvent) => {
    activePill = event.detail.key;
  };
</script>

{#if compact && eventGroup}
  <div class="flex flex-row w-full">
    <div
      class="w-1/3 flex flex-col max-h-full p-4 pl-8 border-r-2 border-gray-200 bg-blueGray-50"
    >
      <ul class="gap-2 items-start">
        {#each [...eventGroup.events] as [id, eventInGroup] (id)}
          <li
            on:click|preventDefault|stopPropagation={() => {
              selectedId = id;
            }}
          >
            <div class="flex gap-2">
              <span class="text-gray-500 mx-1">{id}</span>
              <span class="event-type" class:active={id === selectedId}
                >{eventInGroup.eventType}</span
              >
              {#if isActivityTaskTimedOutEvent(eventInGroup)}
                <WorkflowStatus status="TimedOut" />
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>
    <div class="w-2/3">
      <EventDetailPills
        {attributeGrouping}
        {activePill}
        on:pillChange={handlePillChange}
      />
      {#each Object.entries(attributes) as [key, value] (key)}
        {#if attributeGrouping[activePill]?.includes(key)}
          <EventDetailsRowExpanded {key} {value} class="w-full" />
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <div class="w-full">
    <EventDetailPills
      {attributeGrouping}
      {activePill}
      on:pillChange={handlePillChange}
    />
    {#each Object.entries(attributes) as [key, value] (key)}
      {#if attributeGrouping[activePill]?.includes(key)}
        <EventDetailsRowExpanded {key} {value} class="w-full" />
      {/if}
    {/each}
  </div>
{/if}

<style lang="postcss">
  li {
    @apply my-2 cursor-pointer;
  }
  .event-type:hover {
    @apply text-blue-700 underline decoration-blue-700;
  }
  .active {
    @apply text-blue-700 underline decoration-blue-700;
  }
</style>
