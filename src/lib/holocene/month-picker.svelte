<script lang="ts">
  import { monthNames } from '$lib/utilities/calendar';

  export let months: string[];

  const onClick = (e: MouseEvent, month: string) => {
    if (e.metaKey) {
      if (months.includes(month)) {
        months.filter((m) => m !== month);
      } else {
        months = [...months, month];
      }
    } else {
      months = [month];
    }
  };
</script>

<div class="flex flex-wrap gap-4 text-center">
  {#each monthNames as { label, value }}
    <button
      class="cell"
      class:active={months.includes(value)}
      on:click|preventDefault={(e) => onClick(e, value)}
    >
      {label}
    </button>
  {/each}
</div>

<style lang="postcss">
  .cell {
    @apply cursor-pointer rounded border bg-gray-300 p-2 hover:bg-blue-700 hover:text-white;
  }
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
