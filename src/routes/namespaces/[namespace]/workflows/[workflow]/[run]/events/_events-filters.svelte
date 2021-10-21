<script lang="ts">
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { Download } from 'svelte-hero-icons';
  import type { Writable } from 'svelte/store';

  import { convertToJSON } from '$lib/utilities/convert-to-json';
  import Input from '$lib/components/filter-input.svelte';
  import Button from '$lib/components/main-button.svelte';

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
    <Button on:click={() => setFormat('grid')} styles="py-1 px-3">GRID</Button>
    <Button on:click={() => setFormat('json')} styles="py-1 px-3">JSON</Button>
  </div>
  <div class="flex justify-center items-end">
    <Input
      name="Event History"
      id="filter-by-event-history"
      bind:value={$eventType}
    />
    <Button on:click={clear} styles="ml-2 mb-1 px-3 py-1">Clear</Button>
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
</style>
