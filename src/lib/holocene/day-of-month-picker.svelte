<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ changeDay: { day: number } }>();

  const handleChange = (day: number) => {
    dispatch('changeDay', { day });
  };

  const daysInMonth = Array.from({ length: 31 }).map((_, i) => i + 1);
</script>

<div class="text-center">
  <div
    class="grid-cols-7 grid gap-y-4 gap-x-4 md:gap-x-8 xl:gap-x-16 px-0 md:px-2 xl:px-4 text-center border rounded py-4 border border-gray-900"
  >
    {#each daysInMonth as day}
      <div class="cell" on:click={() => handleChange(day)}>{day}</div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply rounded p-1 w-full cursor-pointer hover:bg-blue-700 hover:text-white;
  }
</style>
