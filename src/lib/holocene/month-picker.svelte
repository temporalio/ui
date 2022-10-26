<script lang="ts">
  import { monthNames } from '$lib/utilities/calendar';
</script>

<div class="text-center">
  <div class="grid-cols-3 grid gap-2 text-center">
    {#each monthNames as month}
      <div class="cell">
        {month}
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply rounded border p-2 w-full cursor-pointer hover:bg-blue-700 hover:text-white;
  }
</style>
