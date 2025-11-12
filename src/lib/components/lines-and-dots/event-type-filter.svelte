<script lang="ts">
  import { writable } from 'svelte/store';

  import Checkbox from '$lib/holocene/checkbox.svelte';
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

  import { CategoryIcon } from './constants';

  type Props = {
    compact: boolean;
  };
  let { compact }: Props = $props();

  let open = writable(false);

  const defaultOptions = $derived(
    compact
      ? compactEventTypeOptions.map((o) => o.value)
      : allEventTypeOptions.map((o) => o.value),
  );

  const options = $derived([
    ...(compact ? compactEventTypeOptions : allEventTypeOptions).map((o) => ({
      ...o,
      label: translate(o.label),
      icon: CategoryIcon[o.value],
      description: translate(o.description),
    })),
  ]);

  const onOptionClick = ({ value }) => {
    clearActiveGroups();
    $eventTypeFilter = $eventTypeFilter.some((type) => type === value)
      ? $eventTypeFilter.filter((type) => type !== value)
      : [...$eventTypeFilter, value];
  };

  const filterActive = $derived(
    $eventTypeFilter.length < defaultOptions.length,
  );
</script>

<MenuContainer {open}>
  <MenuButton controls="status-menu" size="sm">
    <span class="hidden text-sm md:block"
      >{translate('events.event-types')} · {filterActive || $eventStatusFilter
        ? 'Filtered'
        : 'All'}</span
    >
  </MenuButton>
  <Menu
    id="event-type-menu"
    keepOpen
    position="right"
    class="w-[220px] md:w-[360px]"
  >
    <MenuItem
      data-testid={translate('common.all')}
      on:click={() => {
        $eventTypeFilter = defaultOptions;
        $eventStatusFilter = false;
      }}
    >
      <Checkbox
        on:change={() => {
          $eventTypeFilter = defaultOptions;
          $eventStatusFilter = false;
        }}
        slot="leading"
        checked={!$eventStatusFilter &&
          $eventTypeFilter.length === defaultOptions.length}
        label={translate('common.all')}
        labelHidden
        class="mt-px"
      />
      {translate('common.all')}
    </MenuItem>
    {#if $eventViewType !== 'json'}
      <MenuItem
        data-testid={translate('common.pending-and-failed')}
        description={translate('common.pending-and-failed-description')}
        on:click={() => {
          $eventTypeFilter = defaultOptions;
          $eventStatusFilter = !$eventStatusFilter;
        }}
        class="items-start"
      >
        <Checkbox
          on:change={() => {
            $eventTypeFilter = defaultOptions;
            $eventStatusFilter = !$eventStatusFilter;
          }}
          slot="leading"
          checked={$eventStatusFilter}
          label={translate('common.all')}
          labelHidden
          class="mt-px"
        />
        {translate('common.pending-and-failed')}
      </MenuItem>
    {/if}
    <MenuItem
      data-testid={translate('common.none')}
      on:click={() => {
        $eventTypeFilter = [];
        $eventStatusFilter = false;
      }}
    >
      <Checkbox
        on:change={() => {
          $eventTypeFilter = [];
          $eventStatusFilter = false;
        }}
        slot="leading"
        checked={!$eventStatusFilter && !$eventTypeFilter.length}
        label={translate('common.none')}
        labelHidden
        class="mt-px"
      />
      {translate('common.none')}
    </MenuItem>
    <MenuDivider />
    {#each options as option}
      <MenuItem
        data-testid={option.label}
        description={option.description}
        on:click={() => {
          onOptionClick(option);
        }}
        class="items-start"
      >
        <Checkbox
          on:click={() => onOptionClick(option)}
          slot="leading"
          checked={$eventTypeFilter.some((type) => type === option.value)}
          label={option.label}
          labelHidden
          class="mt-px"
        />
        {option.label}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
