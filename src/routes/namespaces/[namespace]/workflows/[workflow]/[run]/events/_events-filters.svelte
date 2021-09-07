<script lang="ts">
  import type { History, DescribeWorkflowExecutionResponse } from '$types';
  import { convertToJSON } from '$lib/utilities/convert-to-json';
  import Icon, { Download } from 'svelte-hero-icons';

  export let eventFormat: string = 'grid';
  export let history: History;
  export let execution: DescribeWorkflowExecutionResponse;

  function setFormat(format: EventFormat) {
    eventFormat = format;
  }

  $: dataUri = convertToJSON(history.events);
</script>

<section class="p-4 flex gap-2 items-center justify-between">
  <div>
    <label for="format">View Format</label>
    <button
      class:active={eventFormat === 'grid'}
      on:click={() => setFormat('grid')}>GRID</button
    >
    <button
      class:active={eventFormat === 'json'}
      on:click={() => setFormat('json')}>JSON</button
    >
  </div>
  <div>
    <a
      class="text-black-500 font-bold uppercase px-3 py-1 text-xs flex"
      href={dataUri}
      download={`${execution.workflowExecutionInfo.type.name}.json`}
    >
      <Icon src={Download} class="text-black w-4 h-4" />export</a
    >
  </div>
</section>

<style lang="postcss">
  label {
    font-size: 14px;
  }
  button {
    @apply text-purple-700 py-1 px-3 border-purple-400 border-2 rounded-md;
  }

  button:hover {
    @apply bg-purple-100;
  }

  .active:hover {
    @apply text-purple-500;
  }

  .active {
    @apply text-purple-100 bg-purple-500;
  }
</style>
