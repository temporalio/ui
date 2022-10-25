<script lang="ts">
  import { weekDays } from '$lib/utilities/calendar';
</script>

<div class="text-center">
  <p class="label">Day of Week</p>
  <div class="grid-cols-7 grid gap-2 text-center">
    {#each weekDays as day}
      <div class="cell">{day}</div>
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
