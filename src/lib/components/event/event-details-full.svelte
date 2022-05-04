<script lang="ts">
  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';
  import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';
  import WorkflowStatus from '../workflow-status.svelte';

  import { formatAttributes } from './_format-attributes';
  import Pill from '../pill.svelte';

  export let event: IterableEvent;
  export let compact = false;
  export let eventGroup: EventGroup | null;
  export let selectedId: string;

  $: attributes = formatAttributes(event, { compact });
  let activePill = 'parent';
</script>

<div class="flex flex-row">
  {#if compact && eventGroup}
    <div
      class="w-1/4 flex flex-col max-h-full p-4 pl-12 border-r-2 border-gray-200"
    >
      <ul class="gap-2 w-full items-start">
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
  {/if}
  <div class="w-3/4">
    <div class="flex flex-row gap-4 px-8 py-4">
      <Pill
        active={activePill === 'summary'}
        on:click={() => (activePill = 'summary')}
        color="indigo">Summary</Pill
      >
      <Pill
        active={activePill === 'parent'}
        on:click={() => (activePill = 'parent')}
        color="blue">Parent</Pill
      >
      <Pill
        active={activePill === 'activity'}
        on:click={() => (activePill = 'activity')}
        color="green">Activity</Pill
      >
      <Pill
        active={activePill === 'taskQueue'}
        on:click={() => (activePill = 'taskQueue')}
        color="yellow">Task Queue</Pill
      >
      <Pill
        active={activePill === 'schedule'}
        on:click={() => (activePill = 'schedule')}
        color="pink">Schedule</Pill
      >
      <Pill
        active={activePill === 'retryPolicy'}
        on:click={() => (activePill = 'retryPolicy')}
        color="purple">Retry Policy</Pill
      >
    </div>
    {#each Object.entries(attributes) as [key, value], index (key)}
      {#if activePill !== 'summary' && key.includes(activePill)}
        <EventDetailsRowExpanded {key} {value} {index} class="w-full" />
      {:else if activePill === 'summary'}
        <EventDetailsRowExpanded {key} {value} {index} class="w-full" />
      {/if}
    {/each}
  </div>
</div>

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
