<script lang="ts">
  import { noop } from 'svelte/internal';

  import { createEventDispatcher } from 'svelte';

  import { getDateRows, weekDays } from '$lib/utilities/calendar';

  const dispatch = createEventDispatcher();

  export let date: Date | undefined;
  export let month: number | undefined;
  export let year: number | undefined;
  export let isAllowed = (_date: Date) => true;

  let cells = [];

  const onChange = (date: number) => {
    dispatch('datechange', new Date(year, month, date));
  };

  const allow = (year: number, month: number, date: number) => {
    if (!date) return true;
    return isAllowed(new Date(year, month, date));
  };

  $: cells = getDateRows(month, year).map((c) => ({
    value: c,
    allowed: allow(year, month, c),
  }));
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
          on:click={allowed && value ? () => onChange(value) : noop}
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
    @apply m-1 inline-flex h-[24px] w-[24px] items-center justify-center rounded-xl p-2 text-sm;
  }

  .selected {
    @apply bg-interactive text-off-white;
  }

  .disabled {
    @apply cursor-not-allowed bg-interactive/50 text-primary;
  }

  .highlight {
    &:not(.disabled) {
      @apply hover:scale-125 hover:cursor-pointer hover:bg-interactive-hover hover:text-off-white;

      transition: transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
</style>
