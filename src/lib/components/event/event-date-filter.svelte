<script context="module">
  export const dateParameter = 'time-format';
</script>

<script lang="ts">
  import { page } from '$app/stores';
  
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    EventSortOrder,
    EventSortOrderOptions,
  } from '$lib/stores/event-view';
  import { eventFilterSort, eventShowElapsed } from '$lib/stores/event-view';
  import { getDateFilterValue } from '$lib/utilities/event-formatting';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let compact: boolean;

  let sortOptions: EventSortOrderOptions = [
    { label: translate('events', 'sort-ascending'), option: 'ascending' },
    { label: translate('events', 'sort-descending'), option: 'descending' },
  ];

  const onSortOptionClick = (option: EventSortOrder) => {
    $eventFilterSort = option;
    updateQueryParameters({
      parameter: 'sort',
      value: option,
      url: $page.url,
    });
  };

  const onShowElapsedClick = () => {
    if ($eventShowElapsed === 'true') {
      $eventShowElapsed = 'false';
    } else {
      $eventShowElapsed = 'true';
    }
  };

  $: value = getDateFilterValue({
    compact,
    sortOrder: $eventFilterSort,
    showElapsed: $eventShowElapsed,
  });
</script>

<DropdownMenu
  label={translate('event-date-filter-label')}
  {value}
  testId="event-date-filter"
>
  <svelte:fragment slot="label">
    <span class="hidden md:block">{translate('date-and-time')}</span>
    <span class="block md:hidden"><Icon name="clock" /></span>
  </svelte:fragment>
  <div class="w-56">
    {#each sortOptions as { option, label } (option)}
      <div class="option" class:active={$eventFilterSort === option}>
        <div class="check active">
          {#if $eventFilterSort === option}
            <Icon name="checkmark" />
          {/if}
        </div>
        <button on:click={() => onSortOptionClick(option)}>
          {label}
        </button>
      </div>
    {/each}

    <div class="option pr-4">
      <div class="check" />
      <div class="my-2 w-full border-b-2 border-gray-300 pr-2" />
    </div>
    <div class="option" class:active={$eventShowElapsed === 'true'}>
      <div class="check active">
        {#if $eventShowElapsed === 'true'}
          <Icon name="checkmark" />
        {/if}
      </div>
      <button class="text-left" on:click={onShowElapsedClick}
        >{translate('events', 'show-elapsed-time')}</button
      >
    </div>
  </div>
</DropdownMenu>

<style lang="postcss">
  .option {
    @apply my-2 flex font-normal;
  }

  .check {
    @apply mx-4 w-4;
  }

  .active {
    @apply text-blue-700;
  }
</style>
