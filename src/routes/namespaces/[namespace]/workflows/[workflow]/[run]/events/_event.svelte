<script lang="ts">
  import { getComponentForEventType } from '$lib/utilities/get-component-for-event-type';
  import { formatDate } from '$lib/utilities/format-date';
  import type { HistoryEvent } from '$types';
  import ExecutionInformation from '../_execution-information.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let event: HistoryEvent;
  export let index: number;

  let even = !(index % 2);
  $: isJSONView = false;
</script>

<tr class:even>
  <td>{event.eventId}</td>
  <td>{event.eventType}</td>
  <td>{formatDate(event.eventTime)}</td>
  <td class="w-1/2">
    <div class="flex">
      <ExecutionInformation title="Version" value={event.version} />
      <ExecutionInformation title="Task ID" value={event.taskId} />
    </div>

    <button on:click={() => (isJSONView = !isJSONView)}
      >{!isJSONView ? 'GRID' : 'JSON'} VIEW</button
    >

    {#if isJSONView}
      <CodeBlock heading={``} content={JSON.stringify(event)} />
    {:else}
      <svelte:component this={getComponentForEventType(event)} {event} />
    {/if}
  </td>
</tr>

<style lang="postcss">
  td {
    vertical-align: top;
    @apply p-4 overflow-x-scroll;
  }

  .even {
    @apply bg-gray-100;
  }

  button {
    font-weight: bold;
    text-align: center;
    background: #343436;
    color: #fff;
    height: 25px;
    width: 15%;
  }

  button:hover {
    @apply bg-purple-400;
  }
</style>
