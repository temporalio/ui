<script lang="ts">
  import { monthNames } from '$lib/utilities/calendar';
</script>

<div class="text-center">
  <p class="label">Month</p>
  <div class="grid-cols-3 grid gap-2 text-center">
    {#each monthNames as month}
      <div class="cell">
        {month}
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .label {
    @apply font-secondary text-sm font-medium;
  }
  .cell {
    @apply rounded border p-1 w-full cursor-pointer hover:bg-blue-700 hover:text-white;
  }
</style>
