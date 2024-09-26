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

<div class="text-center">
  <div
    class="surface-primary grid gap-x-4 gap-y-4 rounded border border-subtle px-0 py-4 text-center md:gap-x-8 md:px-2 xl:gap-x-16 xl:px-4"
  >
    {#each daysInMonth as day}
      {@const active = daysOfMonth.includes(day)}
      <Button
        variant="secondary"
        class={active && 'bg-interactive-secondary-active'}
        on:click={(e) => onClick(e, day)}
      >
        {day}
      </Button>
    {/each}
  </div>
</div>

<style lang="postcss">
  .grid {
    grid-template-columns: repeat(7, minmax(45px, 1fr));
  }
</style>
