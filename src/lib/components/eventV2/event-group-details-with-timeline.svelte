<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import {
    getCodeBlockValue,
    getSingleAttributeForEvent,
    getStackTrace,
  } from '$lib/utilities/get-single-attribute-for-event';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import EventDetailRowItem from './event-detail-row-item.svelte';

  export let event: WorkflowEvent;
  export let compact = true;

  $: attributes = formatAttributes(event, { compact });

  $: eventDetails = Object.entries(attributes);

  const denyKeys = [
    'eventTime',
    'binaryChecksum',
    'scheduledEventId',
    'startedEventId',
  ];

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return !denyKeys.includes(key);
  });
  let expanded = false;
</script>

<div
  class="flex w-full cursor-pointer flex-col justify-between px-2 lg:flex-row"
  on:click|preventDefault|stopPropagation={() => (expanded = !expanded)}
>
  <div class="flex w-full gap-4">
    <div class="flex w-auto min-w-[300px] flex-col justify-center truncate">
      <div class="flex items-center gap-4">
        <p>{event.id}</p>
        <p>{event?.name ?? event?.name}</p>
      </div>
      <div>
        <p class="text-[11px]">{formatDate(event?.eventTime, $timeFormat)}</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      {#each filteredDetails as [key, value] (key)}
        <EventDetailRowItem {key} {value} {attributes} class="w-full" />
      {/each}
    </div>
  </div>
  <div>
    <Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
  </div>
</div>
{#if expanded}
  <div class="h-80">
    <CodeBlock content={stringifyWithBigInt(event)} />
  </div>
{/if}
