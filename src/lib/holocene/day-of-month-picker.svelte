<script lang="ts">
  const daysInMonth = Array.from({ length: 31 }).map((_, i) => i + 1);
</script>

<div class="text-center">
  <div class="grid-cols-7 grid gap-2 text-center">
    {#each daysInMonth as day}
      <div class="cell">{day}</div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply rounded border p-1 w-full cursor-pointer hover:bg-blue-700 hover:text-white;
  }
</style>
