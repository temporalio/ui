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
  import { compactEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import { allClassificationTypeOptions } from '$lib/models/event-history/get-event-classification';
  import type {
    EventSortOrder,
    EventSortOrderOptions,
  } from '$lib/stores/event-view';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventCategoryFilter, eventStatusFilter } from '$lib/stores/filters';
  import { temporalVersion } from '$lib/stores/versions';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { isVersionNewer } from '$lib/utilities/version-check';

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

  $: id = $page.params.id;

  let categoryOptions = compactEventTypeOptions;
  $: {
    if (isVersionNewer('1.21', $temporalVersion)) {
      categoryOptions = categoryOptions.filter(
        ({ option }) => option !== 'update',
      );
    }
  }

  $: visibleCategoryOption = categoryOptions.find(
    ({ option }) => option === $page.url?.searchParams?.get('category'),
  );
  $: $eventCategoryFilter =
    visibleCategoryOption?.option?.toString() ?? undefined;
  const onCategoryOptionClick = (value: string) => {
    updateQueryParameters({
      parameter: 'category',
      value,
      url: $page.url,
    });
  };

  let statusOptions = allClassificationTypeOptions;
  $: visibleStatusOption = statusOptions.find(
    ({ option }) =>
      option?.toString() === $page.url?.searchParams?.get('status'),
  );
  $: $eventStatusFilter = visibleStatusOption?.option.toString() ?? undefined;
  const onStatusOptionClick = (value: string) => {
    updateQueryParameters({
      parameter: 'status',
      value,
      url: $page.url,
    });
  };
</script>

<div class="flex items-center gap-4" id="event-view-toggle">
  <MenuContainer>
    <MenuButton
      controls="event-date-filter-menu"
      data-testid="event-date-filter-button"
      class="flex items-center"
    >
      <Icon class="md:hidden" name="clock" />
      <span class="max-md:hidden">{translate('common.date-and-time')}</span>
      <Icon
        class="max-md:hidden {$eventFilterSort === 'descending' &&
          'rotate-180'}"
        name="arrow-up"
        slot="trailing"
      />
    </MenuButton>
    <Menu id="event-date-filter-menu">
      {#each sortOptions as { option, label }}
        <MenuItem
          selected={$eventFilterSort === option}
          on:click={() => onSortOptionClick(option)}>{label}</MenuItem
        >
      {/each}
      <MenuDivider />
    </Menu>
  </MenuContainer>

  <MenuContainer>
    <MenuButton
      active={!!$eventStatusFilter}
      data-testid="event-status-filter"
      controls="event-status-filter-menu"
      disabled={!!id}
    >
      {translate('events.event-status')}
      <Icon name="filter" slot="trailing" />
    </MenuButton>
    <Menu id="event-status-filter-menu">
      {#each statusOptions as { label, option }}
        <MenuItem
          data-testid="event-status-option"
          selected={$eventStatusFilter === option?.toString()}
          on:click={() => onStatusOptionClick(option?.toString())}
        >
          {translate(label)}
        </MenuItem>
      {/each}
    </Menu>
  </MenuContainer>

  <MenuContainer>
    <MenuButton
      active={!!$eventCategoryFilter}
      data-testid="event-category-filter"
      controls="event-category-filter-menu"
      disabled={!!id}
    >
      {translate('events.event-type')}
      <Icon name="filter" slot="trailing" />
    </MenuButton>
    <Menu id="event-category-filter-menu">
      {#each categoryOptions as { label, option }}
        <MenuItem
          data-testid="event-category-option"
          selected={$eventCategoryFilter === option}
          on:click={() => onCategoryOptionClick(option)}
        >
          {translate(label)}
        </MenuItem>
      {/each}
    </Menu>
  </MenuContainer>
</div>
