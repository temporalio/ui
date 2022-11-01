<script lang="ts">
  import { monthNames } from '$lib/utilities/calendar';

  export let month;
</script>

<div class="flex flex-wrap gap-4 text-center">
  {#each monthNames as { label, value }}
    <button
      class="cell"
      class:active={value === month}
      on:click|preventDefault={() => (month = value)}
    >
      {label}
    </button>
  {/each}
</div>

<style lang="postcss">
  .cell {
    @apply cursor-pointer rounded border bg-gray-300 p-2 hover:bg-blue-700 hover:text-white;
  }
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
