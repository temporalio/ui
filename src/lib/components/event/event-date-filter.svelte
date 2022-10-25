<script context="module">
  export const dateParameter = 'time-format';
</script>

<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    eventFilterSort,
    eventSortOrder,
    eventShowElapsed,
    supportsReverseOrder,
  } from '$lib/stores/event-view';
  import {
    timeFormat,
    setTimeFormat,
    TimeFormatOptions,
  } from '$lib/stores/time-format';
  import type {
    EventSortOrder,
    EventSortOrderOptions,
  } from '$lib/stores/event-view';

  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let sortOptions: EventSortOrderOptions = [
    { label: 'Sort 1-9', option: 'ascending' },
    { label: 'Sort 9-1', option: 'descending' },
  ];

  let dateOptions: TimeFormatOptions = [
    { label: 'UTC Time', option: 'UTC' },
    { label: 'Relative Time', option: 'relative' },
    { label: 'Local Time', option: 'local' },
  ];

  const onSortOptionClick = (option: EventSortOrder) => {
    $eventFilterSort = option;
    updateQueryParameters({
      parameter: 'sort',
      value: option,
      url: $page.url,
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
    $eventSortOrder === 'descending' &&
    $timeFormat === 'UTC' &&
    $eventShowElapsed === 'false'
      ? undefined
      : `${$eventSortOrder}:${$timeFormat}:${$eventShowElapsed}`;
</script>

<DropdownMenu {value} left dataCy="event-date-filter">
  <div class="w-56">
    {#if $supportsReverseOrder}
      {#each sortOptions as { option, label } (option)}
        <div
          class="option"
          class:active={$eventSortOrder === option}
          on:click={() => onSortOptionClick(option)}
        >
          <div class="check active">
            {#if $eventSortOrder === option}
              <Icon name="checkmark" />
            {/if}
          </div>
          <div class="label">
            {label}
          </div>
        </div>
      {/each}

      <div class="option pr-4">
        <div class="check" />
        <div class="my-2 w-full border-b-2 border-gray-300 pr-2" />
      </div>
    {/if}
    {#each dateOptions as { label, option } (option)}
      <div
        class="option"
        class:active={$timeFormat === option}
        on:click={() => onDateOptionClick(option)}
        data-cy="event-date-filter-{option}"
      >
        <div class="check active">
          {#if $timeFormat === option}
            <Icon name="checkmark" />
          {/if}
        </div>
        <div class="label">
          {label}
        </div>
      </div>
    {/each}
    <div class="option pr-4">
      <div class="check" />
      <div class="my-2 w-full border-b-2 border-gray-300 pr-2" />
    </div>
    <div
      class="option"
      class:active={$eventShowElapsed === 'true'}
      on:click={onShowElapsedClick}
    >
      <div class="check active">
        {#if $eventShowElapsed === 'true'}
          <Icon name="checkmark" />
        {/if}
      </div>
      <div class="label">Show Elapsed Time</div>
    </div>
  </div>
</DropdownMenu>

<style lang="postcss">
  .option {
    @apply my-2 flex font-normal;
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
