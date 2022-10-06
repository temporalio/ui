<script lang="ts">
  import { getDateRows, uuid, noop } from './date-time';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // props
  export let date;
  export let month;
  export let year;
  export let isAllowed;

  // local vars to help in render
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let cells;

  // function helpers
  const onChange = (date) => {
    dispatch('datechange', new Date(year, month, date));
  };

  const allow = (year, month, date) => {
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
    {#each weekdays as day}
      <p class="cell">{day}</p>
    {/each}
  </div>

  <div class="row">
    {#each cells as { allowed, value } (uuid())}
      <p
        on:click={allowed && value ? onChange.bind(this, value) : noop}
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
      </p>
    {/each}
  </div>
</div>

<style lang="postcss">
  .container {
    @apply mt-2 px-4 w-[265px] h-[224px];
  }
  .row {
    @apply flex flex-wrap w-[240px];
  }

  .cell {
    @apply inline-flex w-[24px] h-[24px] items-center justify-center p-1 m-1 rounded text-sm;
  }

  .selected {
    @apply bg-blue-700 text-white;
  }

  .highlight {
    transition: transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  .disabled {
    background: #efefef;
    cursor: not-allowed;
    color: #bfbfbf;
  }

  .highlight {
    @apply hover:bg-blue-100 hover:cursor-pointer hover:scale-125;
  }

  .selected.highlight:hover {
    @apply bg-blue-700 text-white;
  }
</style>
