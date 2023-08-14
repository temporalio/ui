<script context="module">
  export const dateParameter = 'time-format';
</script>

<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
    MenuDivider,
  } from '$lib/holocene/menu';
  import { eventFilterSort, eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat, setTimeFormat } from '$lib/stores/time-format';
  import type { TimeFormatOptions } from '$lib/stores/time-format';
  import type {
    EventSortOrder,
    EventSortOrderOptions,
  } from '$lib/stores/event-view';

  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { getDateFilterValue } from '$lib/utilities/event-formatting';
  import type { TimeFormat } from '$lib/types/global';
  import { translate } from '$lib/i18n/translate';

  export let compact: boolean;

  let sortOptions: EventSortOrderOptions = [
    { label: translate('events', 'sort-ascending'), option: 'ascending' },
    { label: translate('events', 'sort-descending'), option: 'descending' },
  ];

  let dateOptions: TimeFormatOptions = [
    { label: translate('relative'), option: 'relative' },
    { label: translate('utc'), option: 'UTC' },
    { label: translate('local'), option: 'local' },
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

  $: value = getDateFilterValue({
    compact,
    timeFormat: $timeFormat,
    sortOrder: $eventFilterSort,
    showElapsed: $eventShowElapsed,
  });
</script>

<MenuContainer>
  <MenuButton
    active={!!value}
    hasIndicator
    variant="table-header"
    controls="event-date-filter-menu"
  >
    {translate('date-and-time')}
  </MenuButton>
  <Menu class="w-80" id="event-date-filter-menu">
    {#each sortOptions as { option, label }}
      <MenuItem
        selected={$eventFilterSort === option}
        on:click={() => onSortOptionClick(option)}>{label}</MenuItem
      >
    {/each}
    <MenuDivider />
    {#each dateOptions as { option, label }}
      <MenuItem
        selected={$timeFormat === option}
        on:click={() => onDateOptionClick(option)}>{label}</MenuItem
      >
    {/each}
    <MenuDivider />
    <MenuItem
      selected={$eventShowElapsed === 'true'}
      on:click={onShowElapsedClick}
      >{translate('events', 'show-elapsed-time')}</MenuItem
    >
  </Menu>
</MenuContainer>
