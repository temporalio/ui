<script context="module">
  export const dateParameter = 'time-format';
</script>

<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCheck } from '@fortawesome/free-solid-svg-icons';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    eventFilterSort,
    eventTimeFormat,
    setFilterSort,
    setTimeFormat,
  } from '$lib/stores/event-filters';

  let sortOptions = [
    { label: 'Sort 1-9', option: 'asc' },
    { label: 'Sort 9-1', option: 'desc' },
  ];

  let dateOptions = [
    { label: 'UTC Time', option: 'UTC' },
    { label: 'Relative Time', option: 'relative' },
    { label: 'Local Time', option: 'local' },
  ];

  let value = undefined;
  $: sortDirection = $eventFilterSort;
  $: timeFormat = $eventTimeFormat;

  $: {
    setFilterSort(sortDirection);
    value = sortDirection;
  }

  $: {
    setTimeFormat(timeFormat);
    value = timeFormat;
  }

  const onSortOptionClick = (option: string) => {
    sortDirection = option;
  };

  const onDateOptionClick = (option: string) => {
    timeFormat = option;
  };
</script>

<DropdownMenu {value}>
  {#each sortOptions as { option, label } (option)}
    <div
      class="option"
      class:active={sortDirection === option}
      on:click={() => onSortOptionClick(option)}
    >
      <div class="check">
        {#if sortDirection === option}
          <Icon icon={faCheck} />
        {/if}
      </div>
      <div class="label">
        {label}
      </div>
    </div>
  {/each}
  <div class="option pr-4">
    <div class="check" />
    <div class="my-2 pr-2 w-full border-b-2 border-gray-300" />
  </div>
  {#each dateOptions as { label, option } (option)}
    <div
      class="option"
      class:active={timeFormat === option}
      on:click={() => onDateOptionClick(option)}
    >
      <div class="check">
        {#if timeFormat === option}
          <Icon icon={faCheck} />
        {/if}
      </div>
      <div class="label">
        {label}
      </div>
    </div>
  {/each}
  <div class="option pr-4">
    <div class="check" />
    <div class="my-2 pr-2 w-full border-b-2 border-gray-300" />
  </div>
  <div class="option pr-4">
    <div class="check" />
    <div class="label">Show Elapsed Time</div>
  </div>
</DropdownMenu>

<style lang="postcss">
  .option {
    @apply font-normal flex my-2;
  }
  .label {
    @apply cursor-pointer;
  }
  .check {
    @apply mx-4 w-4;
  }
  .active {
    @apply text-blue-700;
  }
</style>
