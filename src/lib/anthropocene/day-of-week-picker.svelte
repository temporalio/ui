<script lang="ts">
  import Button from '$lib/anthropocene/button.svelte';
  import { genericWeekDays, weekDays } from '$lib/utilities/calendar';

  interface Props {
    daysOfWeek: string[];
  }

  let { daysOfWeek = $bindable([]) }: Props = $props();

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
  <div class="flex flex-wrap gap-2 text-center">
    {#each genericWeekDays as { label, value }}
      {@const active = daysOfWeek.includes(value)}
      <Button
        variant="secondary"
        class={active && 'bg-interactive-secondary-active'}
        onclick={(e) => onClick(e, value)}
      >
        {label}
      </Button>
    {/each}
  </div>
  <div class="flex flex-wrap gap-2 text-center">
    {#each weekDays as { label, value }}
      {@const active = daysOfWeek.includes(value)}
      <Button
        variant="secondary"
        class={active && 'bg-interactive-secondary-active'}
        onclick={(e) => onClick(e, value)}
      >
        {label}
      </Button>
    {/each}
  </div>
</div>
