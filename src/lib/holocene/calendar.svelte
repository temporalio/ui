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
    {#each weekDays as day}
      <p class="cell">{day.label.slice(0, 2)}</p>
    {/each}
  </div>

  <div class="row">
    {#each cells as { allowed, value }, index (index)}
      {#if value}
        <button
          type="button"
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
  @reference "../../app.css";

  .container {
    @apply mt-2 h-[224px] w-[265px] px-4;
  }

  .row {
    @apply flex w-[240px] flex-wrap;
  }

  .cell {
    @apply m-1 inline-flex h-[24px] w-[24px] items-center justify-center rounded-xl p-2 text-sm;
  }

  .selected {
    @apply bg-interactive text-off-white;
  }

  .disabled {
    @apply bg-interactive/50 text-primary cursor-not-allowed;
  }

  .highlight {
    &:not(.disabled) {
      @apply hover:bg-interactive-hover hover:text-off-white hover:scale-125 hover:cursor-pointer;

      transition: transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
</style>
