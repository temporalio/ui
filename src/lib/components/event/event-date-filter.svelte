<script context="module">
  export const dateParameter = 'time-format';
</script>

<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCheck } from '@fortawesome/free-solid-svg-icons';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import { eventFilterSort, eventShowElapsed } from '$lib/stores/event-views';
  import {
    timeFormat,
    setTimeFormat,
    TimeFormatOptions,
  } from '$lib/stores/time-format';
  import type {
    EventFilterType,
    EventFilterTypeOptions,
  } from '$lib/stores/event-views';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let sortOptions: EventFilterTypeOptions = [
    { label: 'Sort 1-9', option: 'ascending' },
    { label: 'Sort 9-1', option: 'descending' },
  ];

  let dateOptions: TimeFormatOptions = [
    { label: 'UTC Time', option: 'UTC' },
    { label: 'Relative Time', option: 'relative' },
    { label: 'Local Time', option: 'local' },
  ];

  const onSortOptionClick = (option: EventFilterType) => {
    $eventFilterSort = option;
    updateQueryParameters({
      parameter: 'sort',
      value: option,
      url: $page.url,
      goto,
    });
  };

  const onDateOptionClick = (option: TimeFormat) => {
    setTimeFormat(option);
  };

  const onShowElapsedClick = () => {
    if ($eventShowElapsed === 'true') {
      $eventShowElapsed = 'false';
    } else {
      $eventShowElapsed = 'true';
    }
  };

  $: value =
    $eventFilterSort === 'descending' &&
    $timeFormat === 'UTC' &&
    $eventShowElapsed === 'false'
      ? undefined
      : `${$eventFilterSort}:${$timeFormat}:${$eventShowElapsed}`;
</script>

<DropdownMenu {value} right>
  {#each sortOptions as { option, label } (option)}
    <div
      class="option"
      class:active={$eventFilterSort === option}
      on:click={() => onSortOptionClick(option)}
    >
      <div class="check">
        {#if $eventFilterSort === option}
          <Icon icon={faCheck} scale={0.8} />
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
      class:active={$timeFormat === option}
      on:click={() => onDateOptionClick(option)}
    >
      <div class="check">
        {#if $timeFormat === option}
          <Icon icon={faCheck} scale={0.8} />
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
  <div
    class="option"
    class:active={$eventShowElapsed === 'true'}
    on:click={onShowElapsedClick}
  >
    <div class="check">
      {#if $eventShowElapsed === 'true'}
        <Icon icon={faCheck} scale={0.8} />
      {/if}
    </div>
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
    @apply mx-4 w-4 mt-1;
  }
  .active {
    @apply text-blue-700;
  }
</style>
