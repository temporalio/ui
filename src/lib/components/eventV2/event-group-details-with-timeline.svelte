<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import EventDetailRowItem from './event-detail-row-item.svelte';

  export let event: WorkflowEvent;
  export let compact = true;

  $: attributes = formatAttributes(event, { compact });

  $: eventDetails = Object.entries(attributes);
  const allowedKeys = [
    'eventTime',
    'identity',
    'signalName',
    'markerName',
    // 'details',
    // 'input',
    'namespace',
    'startToFireTimeout',
  ];

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return allowedKeys.includes(key);
  });

  let expanded = false;
</script>

<div
  class="flex w-full flex-col lg:flex-row justify-between cursor-pointer border-b-3 border-gray-900 p-2"
  on:click|preventDefault|stopPropagation={() => (expanded = !expanded)}
>
  <div class="w-full flex gap-4">
    <div class="flex gap-4 items-center w-48 truncate">
      <p>{event.id}</p>
      <p>{event?.classification ?? event?.name}</p>
    </div>
    <div class="flex gap-4">
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
