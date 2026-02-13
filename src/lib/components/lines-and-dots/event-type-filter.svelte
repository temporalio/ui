<script lang="ts">
  import { writable } from 'svelte/store';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { clearActiveGroups } from '$lib/stores/active-events';
  import { eventViewType } from '$lib/stores/event-view';
  import { eventStatusFilter, eventTypeFilter } from '$lib/stores/filters';
  import { temporalVersion } from '$lib/stores/versions';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';
  import { nexusEnabled } from '$lib/utilities/nexus-enabled';
  import { isVersionNewer } from '$lib/utilities/version-check';

  import { CategoryIcon } from './constants';

  export let compact = false;
  export let minimized = true;

  let open = writable(false);

  $: defaultOptions = compact
    ? compactEventTypeOptions.map((o) => o.value)
    : allEventTypeOptions.map((o) => o.value);

  $: options = [
    ...(compact ? compactEventTypeOptions : allEventTypeOptions).map((o) => ({
      ...o,
      label: translate(o.label),
      icon: CategoryIcon[o.value],
      description: translate(o.description),
    })),
  ];

  $: {
    if (isVersionNewer('1.21.0', $temporalVersion)) {
      options = options.filter(({ value }) => value !== 'update');
    }
  }

  $: {
    if (!nexusEnabled($page.data.systemInfo?.capabilities)) {
      options = options.filter(({ value }) => value !== 'nexus');
    }
  }

  const onOptionClick = ({ value }) => {
    clearActiveGroups();
    const newCategories = $eventTypeFilter.some((type) => type === value)
      ? $eventTypeFilter.filter((type) => type !== value)
      : [...$eventTypeFilter, value];
    $eventTypeFilter = newCategories;
    updateEventFilterParams(
      $page.url,
      {
        categories:
          newCategories.length === defaultOptions.length ? null : newCategories,
      },
      goto,
    );
  };

  const onAllClick = () => {
    $eventTypeFilter = defaultOptions;
    $eventStatusFilter = false;
    updateEventFilterParams(
      $page.url,
      { categories: null, statusFilter: false },
      goto,
    );
  };

  const onPendingClick = () => {
    $eventTypeFilter = defaultOptions;
    $eventStatusFilter = !$eventStatusFilter;
    updateEventFilterParams(
      $page.url,
      { categories: null, statusFilter: !$eventStatusFilter },
      goto,
    );
  };

  const onNoneClick = () => {
    $eventTypeFilter = [];
    $eventStatusFilter = false;
    updateEventFilterParams(
      $page.url,
      { categories: [], statusFilter: false },
      goto,
    );
  };

  $: filterActive = $eventTypeFilter.length < defaultOptions.length;
</script>

<MenuContainer {open}>
  <MenuButton controls="status-menu" size="sm">
    {#snippet leading()}
      <div
        class="flex h-6 w-6 flex-col items-center justify-center rounded-full transition-colors duration-200"
        class:bg-interactive={filterActive}
      >
        <Icon name="filter" class={filterActive && 'pt-0.5 text-white'} />
      </div>
    {/snippet}
    <span class="hidden text-sm md:block">{translate('common.filter')}</span>
  </MenuButton>
  <Menu
    id="event-type-menu"
    keepOpen
    position={minimized ? 'top-right' : 'right'}
    class="w-[220px] md:w-[360px]"
  >
    <MenuItem data-testid={translate('common.all')} onclick={onAllClick}>
      {#snippet leading()}
        <Checkbox
          on:change={onAllClick}
          checked={!$eventStatusFilter &&
            $eventTypeFilter.length === defaultOptions.length}
          label={translate('common.all')}
          labelHidden
          class="mt-px"
        />
      {/snippet}
      {translate('common.all')}
    </MenuItem>
    {#if $eventViewType !== 'json'}
      <MenuItem
        data-testid={translate('common.pending-and-failed')}
        description={translate('common.pending-and-failed-description')}
        onclick={onPendingClick}
        class="items-start"
      >
        {#snippet leading()}
          <Checkbox
            on:change={onPendingClick}
            checked={$eventStatusFilter}
            label={translate('common.all')}
            labelHidden
            class="mt-px"
          />
        {/snippet}
        {translate('common.pending-and-failed')}
      </MenuItem>
    {/if}
    <MenuItem data-testid={translate('common.none')} onclick={onNoneClick}>
      {#snippet leading()}
        <Checkbox
          on:change={onNoneClick}
          checked={!$eventStatusFilter && !$eventTypeFilter.length}
          label={translate('common.none')}
          labelHidden
          class="mt-px"
        />
      {/snippet}
      {translate('common.none')}
    </MenuItem>
    <MenuDivider />
    {#each options as option}
      <MenuItem
        data-testid={option.label}
        description={option.description}
        onclick={() => {
          onOptionClick(option);
        }}
        class="items-start"
      >
        {#snippet leading()}
          <Checkbox
            on:click={() => onOptionClick(option)}
            checked={$eventTypeFilter.some((type) => type === option.value)}
            label={option.label}
            labelHidden
            class="mt-px"
          />
        {/snippet}
        {option.label}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
