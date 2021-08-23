<script lang="ts">
  export let eventFormat: string = 'grid';

  function setFormat(format) {
    eventFormat = format;
  }
</script>

<section class="p-4 flex gap-2 items-center">
  <label for="format">View Format</label>
  <button
    class:active={eventFormat === 'grid'}
    on:click={() => setFormat('grid')}>GRID</button
  >
  <button
    class:active={eventFormat === 'json'}
    on:click={() => setFormat('json')}>JSON</button
  >
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
