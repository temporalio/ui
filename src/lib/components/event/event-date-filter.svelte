<script context="module">
  export const dateParameter = 'time-format';
</script>

<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';
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
    { label: translate('events.sort-ascending'), option: 'ascending' },
    { label: translate('events.sort-descending'), option: 'descending' },
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

<MenuContainer>
  <MenuButton
    active={!!value}
    hasIndicator
    variant="table-header"
    controls="event-date-filter-menu"
    data-testid="event-date-filter-button"
  >
    <Icon class="md:hidden" name="clock" />
    <span class="max-md:hidden">{translate('common.date-and-time')}</span>
  </MenuButton>
  <Menu class="w-80" id="event-date-filter-menu">
    {#each sortOptions as { option, label }}
      <MenuItem
        selected={$eventFilterSort === option}
        on:click={() => onSortOptionClick(option)}>{label}</MenuItem
      >
    {/each}
    <MenuDivider />
    <MenuItem
      selected={$eventShowElapsed === 'true'}
      on:click={onShowElapsedClick}
      >{translate('events.show-elapsed-time')}</MenuItem
    >
  </Menu>
</MenuContainer>
