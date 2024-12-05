<script lang="ts">
  import Button from '$lib/holocene/button.svelte';

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

<div
  class="surface-primary grid place-items-center gap-1 rounded border border-subtle px-0 py-4 text-center sm:gap-4 md:gap-x-8 md:px-2 xl:gap-x-16 xl:px-4"
>
  {#each daysInMonth as day}
    {@const active = daysOfMonth.includes(day)}
    <Button
      variant="secondary"
      class="max-md:h-9 max-md:px-4 max-md:py-1.5 max-md:text-sm max-sm:h-8 max-sm:px-2 max-sm:py-1 max-sm:text-xs {active &&
        'bg-interactive-secondary-active'}"
      on:click={(e) => onClick(e, day)}
    >
      {day}
    </Button>
  {/each}
</div>

<style lang="postcss">
  .grid {
    grid-template-columns: repeat(7, minmax(32px, 1fr));
  }
</style>
