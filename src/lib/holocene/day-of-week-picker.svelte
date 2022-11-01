<script lang="ts">
  import { genericWeekDays, weekDays } from '$lib/utilities/calendar';

  export let dayOfWeek = '';
</script>

<div class="flex flex-col gap-4 text-center">
  <div class="flex gap-2 text-center">
    {#each genericWeekDays as { label, value }}
      <button
        class="cell"
        class:active={dayOfWeek === value}
        on:click|preventDefault={() => (dayOfWeek = value)}>{label}</button
      >
    {/each}
  </div>
  <div class="flex flex-wrap gap-2 text-center">
    {#each weekDays as { label, value }}
      <button
        class="cell"
        class:active={dayOfWeek === value}
        on:click|preventDefault={() => (dayOfWeek = value)}>{label}</button
      >
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply w-auto cursor-pointer rounded border bg-gray-300 p-2 hover:bg-blue-700 hover:text-white;
  }
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
