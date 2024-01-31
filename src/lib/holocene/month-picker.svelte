<script lang="ts">
  import { monthNames } from '$lib/utilities/calendar';

  export let months: string[];

  const onClick = (e: MouseEvent, month: string) => {
    if (e.metaKey && month !== '*') {
      if (months.includes('*')) {
        months = months.filter((m) => m !== '*');
      }
      if (months.includes(month)) {
        months = months.filter((m) => m !== month);
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
    @apply hover: cursor-pointer rounded border-2 border-slate-300 bg-slate-300 from-blue-100 to-purple-100  p-2 hover:bg-gradient-to-br hover:text-primary;
  }

  .active {
    @apply bg-slate-900 text-white;
  }
</style>
