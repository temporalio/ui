<script lang="ts">
  import { writable } from 'svelte/store';

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
  import { clearActiveEvents } from '$lib/stores/active-events';
  import { eventTypeFilter } from '$lib/stores/filters';
  import { nexusEnabled } from '$lib/utilities/nexus-enabled';

  import { CategoryIcon } from './constants';

  let { compact = false }: { compact?: boolean } = $props();

  let open = writable(false);

  const allOptions = $derived(
    nexusEnabled($page.data.systemInfo?.capabilities)
      ? allEventTypeOptions
      : allEventTypeOptions.filter((o) => o.value !== 'nexus'),
  );

  const compactOptions = $derived(
    nexusEnabled($page.data.systemInfo?.capabilities)
      ? compactEventTypeOptions
      : compactEventTypeOptions.filter((o) => o.value !== 'nexus'),
  );

  const defaultOptions = $derived(
    compact
      ? compactOptions.map((o) => o.value)
      : allOptions.map((o) => o.value),
  );

  let options = $derived([
    ...(compact ? compactOptions : allOptions).map((o) => ({
      ...o,
      label: translate(o.label),
      icon: CategoryIcon[o.value],
      description: translate(o.description),
    })),
  ]);

  const onOptionClick = ({ value }) => {
    clearActiveEvents();
    $eventTypeFilter = $eventTypeFilter.some((type) => type === value)
      ? $eventTypeFilter.filter((type) => type !== value)
      : [...$eventTypeFilter, value];
  };

  const filterActive = $derived(
    $eventTypeFilter.length < defaultOptions.length,
  );
</script>

<MenuContainer {open}>
  <MenuButton controls="status-menu">
    <div
      slot="leading"
      class="flex h-6 w-6 flex-col items-center justify-center rounded-full transition-colors duration-200"
      class:bg-interactive={filterActive}
    >
      <Icon name="filter" class={filterActive && 'pt-0.5 text-white'} />
    </div>
    {translate('events.event-types')}
  </MenuButton>
  <Menu
    id="event-type-menu"
    keepOpen
    position="top-right"
    class="w-[240px] md:w-[400px]"
  >
    <MenuItem
      data-testid={translate('common.all')}
      onclick={() => {
        $eventTypeFilter = defaultOptions;
      }}
    >
      {#snippet leading()}
        <Checkbox
          onchange={() => {
            $eventTypeFilter = defaultOptions;
          }}
          checked={$eventTypeFilter.length === defaultOptions.length}
          label={translate('common.all')}
          labelHidden
        />
      {/snippet}
      {translate('common.all')}
    </MenuItem>
    <MenuItem
      data-testid={translate('common.none')}
      onclick={() => {
        $eventTypeFilter = [];
      }}
    >
      {#snippet leading()}
        <Checkbox
          onchange={() => {
            $eventTypeFilter = [];
          }}
          checked={!$eventTypeFilter.length}
          label={translate('common.none')}
          labelHidden
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
        className="items-start"
      >
        {#snippet leading()}
          <Checkbox
            onclick={() => onOptionClick(option)}
            checked={$eventTypeFilter.some((type) => type === option.value)}
            label={option.label}
            labelHidden
          />
        {/snippet}
        {option.label}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
