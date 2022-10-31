<script lang="ts">
  const daysInMonth = Array.from({ length: 31 }).map((_, i) =>
    (i + 1).toString(),
  );

  export let dayOfMonth = '';
</script>

<div class="text-center">
  <div
    class="grid grid-cols-7 gap-y-4 gap-x-4 rounded border border border-gray-900 px-0 py-4 text-center md:gap-x-8 md:px-2 xl:gap-x-16 xl:px-4"
  >
    {#each daysInMonth as day}
      <button
        class="cell"
        class:active={dayOfMonth === day}
        on:click|preventDefault={() => (dayOfMonth = day)}>{day}</button
      >
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply w-full cursor-pointer rounded p-1 text-sm hover:bg-blue-700 hover:text-white;
  }
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
