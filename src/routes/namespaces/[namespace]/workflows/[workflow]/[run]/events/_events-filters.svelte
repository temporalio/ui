<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { convertToJSON } from '$lib/utilities/convert-to-json';
  import Icon, { Download } from 'svelte-hero-icons';
  import Input from '$lib/components/filter-input.svelte';

  export let events: BaseEvent[];
  export let eventFormat: Writable<EventFormat>;
  export let eventType: Writable<string>;
  export let execution: string;

  function setFormat(format: EventFormat) {
    $eventFormat = format;
  }

  function clear() {
    $eventType = null;
  }

  $: dataUri = convertToJSON(events);
</script>

<section class="p-4 flex gap-2 items-center justify-between">
  <div>
    <label for="format">View Format</label>
    <button
      class:active={$eventFormat === 'grid'}
      on:click={() => setFormat('grid')}>GRID</button
    >
    <button
      class:active={$eventFormat === 'json'}
      on:click={() => setFormat('json')}>JSON</button
    >
  </div>
  <div class="flex justify-center items-end">
    <Input
      name="Event History"
      id="filter-by-event-history"
      bind:value={$eventType}
    />
    <button class="ml-2" on:click={clear}>Clear</button>
  </div>
  <div>
    <a
      class="text-black-500 font-bold uppercase px-3 py-1 text-xs flex"
      href={dataUri}
      download={`${execution}.json`}
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
