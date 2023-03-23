<script lang="ts">
  const daysInMonth = Array.from({ length: 31 }).map((_, i) => i + 1);

  export let daysOfMonth: number[];

  const onClick = (e: MouseEvent, day: number) => {
    if (e.metaKey) {
      if (daysOfMonth.includes(day)) {
        daysOfMonth.filter((d) => d !== day);
      } else {
        daysOfMonth = [...daysOfMonth, day];
      }
    } else {
      daysOfMonth = [day];
    }
  };
</script>

<div class="text-center">
  <div
    class="grid gap-y-4 gap-x-4 rounded border border-gray-900 bg-white px-0 py-4 text-center md:gap-x-8 md:px-2 xl:gap-x-16 xl:px-4"
  >
    {#each daysInMonth as day}
      <button
        class="cell"
        class:active={daysOfMonth.includes(day)}
        on:click|preventDefault={(e) => onClick(e, day)}>{day}</button
      >
    {/each}
  </div>
</div>

<style lang="postcss">
  .grid {
    grid-template-columns: repeat(7, minmax(45px, 1fr));
  }

  .cell {
    @apply h-10 cursor-pointer rounded border-2 border-gray-300 from-blue-100 to-purple-100 p-1  hover:border-gray-900 hover:bg-gradient-to-br hover:text-gray-900;
  }

  .active {
    @apply border-gray-900 bg-gray-900 text-white;
  }
</style>
