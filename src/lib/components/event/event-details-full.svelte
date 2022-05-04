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
  import Pill from '../pill.svelte';

  export let event: IterableEvent;
  export let compact = false;
  export let eventGroup: EventGroup | null;
  export let selectedId: string;

  $: attributes = formatAttributes(event, { compact });
  $: attributeGrouping = attributeGroups(attributes);
  $: activePill = Object.keys(attributeGrouping)[0];

  const handlePillChange = (event: CustomEvent) => {
    activePill = event.detail.key;
  };

  console.log('EVENT: ', event);
</script>

{#if compact && eventGroup}
  <div class="flex flex-col md:flex-row w-full">
    <div
      class="w-full block md:w-1/3 md:flex flex-col max-h-full bg-gray-100 p-4 pl-8"
    >
      <ul class="gap-2 items-start">
        {#each [...eventGroup.events] as [id, eventInGroup] (id)}
          <li
            on:click|preventDefault|stopPropagation={() => {
              selectedId = id;
            }}
          >
            <div class="flex gap-2">
              <!-- <span class="text-gray-500 mx-1">{id}</span> -->
              <!-- <span class="event-type" class:active={id === selectedId}
                >{eventInGroup.eventType}</span
              > -->
              <Pill active={id === selectedId}
                >{eventInGroup.eventType}
                {#if isActivityTaskTimedOutEvent(eventInGroup)}
                  <WorkflowStatus status="TimedOut" />
                {/if}
              </Pill>
            </div>
          </li>
        {/each}
      </ul>
    </div>
    <div class="w-full block md:w-2/3">
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
