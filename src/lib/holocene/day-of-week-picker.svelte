<script lang="ts">
  import { weekDays } from '$lib/utilities/calendar';
</script>

<div class="text-center">
  <div class="grid-cols-7 grid gap-2 text-center">
    {#each weekDays as day}
      <div class="cell">{day}</div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply rounded border p-2 w-full cursor-pointer hover:bg-blue-700 hover:text-white;
  }
</style>
