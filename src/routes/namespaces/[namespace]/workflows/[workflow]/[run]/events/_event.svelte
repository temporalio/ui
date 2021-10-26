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
  $: isIdJSONView = false;
  $: isEventTypeJSONView = false;
  $: isTimeJSONView = false;
  $: isDetailsJSONView = false;
</script>

<tr class:even>
  <td
    class="dark:bg-gray-700 dark:text-gray-200"
    on:click={() => (isIdJSONView = !isIdJSONView)}
  >
    {#if isIdJSONView}
      <CodeBlock content={event.eventId} />
    {:else}
      {event.eventId}
    {/if}
  </td>
  <td
    class="dark:bg-gray-700 dark:text-gray-200"
    on:click={() => (isEventTypeJSONView = !isEventTypeJSONView)}
  >
    {#if isEventTypeJSONView}
      <CodeBlock content={event.eventType} />
    {:else}
      {event.eventType}
    {/if}
  </td>
  <td
    class="dark:bg-gray-700 dark:text-gray-200"
    on:click={() => (isTimeJSONView = !isTimeJSONView)}
  >
    {#if isTimeJSONView}
      <CodeBlock content={event.eventTime} />
    {:else}
      {formatDate(event.eventTime)}
    {/if}</td
  >
  <td
    on:click={() => (isDetailsJSONView = !isDetailsJSONView)}
    class="w-1/2 dark:bg-gray-700 dark:text-gray-200"
  >
    {#if isDetailsJSONView}
      <CodeBlock
        content={{
          verison: event.version,
          TaskId: event.taskId,
        }}
      />
    {:else}
      <div class="flex">
        <ExecutionInformation title="Version" value={event.version} />
        <ExecutionInformation title="Task ID" value={event.taskId} />
      </div>
    {/if}

    <button
      on:click={(e) => {
        e.stopPropagation();
        isJSONView = !isJSONView;
      }}>{!isJSONView ? 'GRID' : 'JSON'} VIEW</button
    >

    {#if isJSONView}
      <CodeBlock content={event} />
    {:else}
      <svelte:component this={getComponentForEventType(event)} {event} />
    {/if}
  </td>
</tr>

<style lang="postcss">
  td {
    vertical-align: top;
    cursor: pointer;
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
