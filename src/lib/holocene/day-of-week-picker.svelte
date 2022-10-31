<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    changeDayOfWeek: { day: string };
  }>();

  const handleChange = (day: string) => {
    dispatch('changeDayOfWeek', { day });
  };

  import { genericWeekDays, weekDays } from '$lib/utilities/calendar';
</script>

<div class="flex flex-col gap-4 text-center">
  <div class="flex gap-2 text-center">
    {#each genericWeekDays as day}
      <div class="cell" on:click={() => handleChange(day)}>{day}</div>
    {/each}
  </div>
  <div class="flex flex-wrap gap-2 text-center">
    {#each weekDays as day}
      <div class="cell" on:click={() => handleChange(day)}>{day}</div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply rounded border w-24 p-2 text-sm cursor-pointer bg-gray-300 hover:bg-blue-700 hover:text-white;
  }
</style>
