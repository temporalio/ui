<script lang="ts">
  
    export let eventFormat: string = 'grid';

    function setFormat(format) {
        eventFormat = format;
  }
  </script>
  
  <section class="p-4 flex gap-8">
    <button on:click={() => setFormat('grid')}>Grid</button>
    <button on:click={() => setFormat('json')}>JSON</button>
  </section>
  
  <style lang="postcss">
    button {
      @apply text-purple-700 py-4 px-6 border-purple-400 border-2 rounded-md;
    }
  
    button:hover {
      @apply bg-purple-100;
    }
  </style>
  