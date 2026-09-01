<script lang="ts">
  import { getDateRows, weekDays } from '$lib/utilities/calendar';

  type Props = {
    date: Date;
    month: number;
    year: number;
    isAllowed?: (date: Date) => boolean;
    onDateChange?: (date: Date) => void;
  };

  let {
    date,
    month,
    year,
    isAllowed = (_date: Date) => true,
    onDateChange,
  }: Props = $props();

  const onChange = (selectedDay: number) => {
    onDateChange?.(new Date(year, month, selectedDay));
  };

  const allow = (year: number, month: number, day: number | undefined) => {
    if (!day) return true;
    return isAllowed(new Date(year, month, day));
  };

  const cells = $derived(
    getDateRows(month, year).map((c) => ({
      value: c,
      allowed: allow(year, month, c),
    })),
  );
</script>

<div class="container">
  <div class="row">
    {#each weekDays as day (day.label)}
      <p class="cell">{day.label.slice(0, 2)}</p>
    {/each}
  </div>

  <div class="row">
    {#each cells as { allowed, value }, index (index)}
      {#if value}
        <button
          type="button"
          disabled={!allowed}
          onclick={allowed && value ? () => onChange(value) : () => {}}
          class="cell"
          class:highlight={allowed && value}
          class:disabled={!allowed}
          class:selected={new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          ).getTime() === new Date(year, month, value).getTime()}
        >
          {value || ''}
        </button>
      {:else}
        <div class="cell"></div>
      {/if}
    {/each}
  </div>
</div>

<style lang="postcss">
  .container {
    @apply mt-2 h-[224px] w-[265px] px-4;
  }

  .row {
    @apply flex w-[240px] flex-wrap;
  }

  .cell {
    @apply m-1 inline-flex h-[24px] w-[24px] items-center justify-center rounded-xl p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary;
  }

  .selected {
    @apply bg-interactive-primary text-white;
  }

  .disabled {
    @apply cursor-not-allowed opacity-disabled;
  }

  .highlight:not(.disabled) {
    @apply cursor-pointer;
  }

  .highlight:not(.disabled, .selected) {
    @apply hover:bg-interactive-tertiary-hover focus-visible:bg-background-primary;
  }

  .highlight.selected:not(.disabled) {
    @apply hover:bg-interactive-primary-hover hover:text-white focus-visible:bg-interactive-primary;
  }
</style>
