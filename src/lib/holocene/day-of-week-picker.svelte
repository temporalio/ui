<script lang="ts">
  import { genericWeekDays, weekDays } from '$lib/utilities/calendar';

  export let daysOfWeek: string[];

  const onClick = (e: MouseEvent, day: string) => {
    if (e.metaKey) {
      // For preventing mixing Generic and Sunday-Friday
      if (genericWeekDays.find((g) => g.value === day)) {
        daysOfWeek = [day];
      } else if (
        daysOfWeek.find((d) => genericWeekDays.find((g) => g.value === d))
      ) {
        daysOfWeek = [day];
      }

      // For Sunday-Friday
      if (daysOfWeek.includes(day)) {
        daysOfWeek.filter((d) => d !== day);
      } else {
        daysOfWeek = [...daysOfWeek, day];
      }
    } else {
      daysOfWeek = [day];
    }
  };
</script>

<div class="flex flex-col gap-4 text-center">
  <div class="flex gap-2 text-center">
    {#each genericWeekDays as { label, value }}
      <button
        class="cell"
        class:active={daysOfWeek.includes(value)}
        on:click|preventDefault={(e) => onClick(e, value)}>{label}</button
      >
    {/each}
  </div>
  <div class="flex flex-wrap gap-2 text-center">
    {#each weekDays as { label, value }}
      <button
        class="cell"
        class:active={daysOfWeek.includes(value)}
        on:click|preventDefault={(e) => onClick(e, value)}>{label}</button
      >
    {/each}
  </div>
</div>

<style lang="postcss">
  .cell {
    @apply w-auto cursor-pointer rounded border-2 border-gray-300 bg-gray-300 from-blue-100 to-purple-100 p-2  hover:border-gray-900 hover:bg-gradient-to-br;
  }

  .active {
    @apply border-gray-900 bg-gray-900 text-white hover:text-gray-900;
  }
</style>
