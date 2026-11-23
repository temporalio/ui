<script lang="ts">
  import { writable } from 'svelte/store';

  import { page } from '$app/state';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconFilter } from '$lib/io/icon';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';
  import { temporalVersion } from '$lib/stores/versions';
  import type {
    EventTypeCategory,
    EventTypeFilterChange,
  } from '$lib/types/events';
  import { nexusEnabled } from '$lib/utilities/nexus-enabled';
  import { isVersionNewer } from '$lib/utilities/version-check';

  import { CategoryIcon } from './constants';

  interface Props {
    compact?: boolean;
    statusFilterAvailable?: boolean;
    eventTypes: EventTypeCategory[];
    statusFilter: boolean;
    onChange: (change: EventTypeFilterChange) => void;
  }

  let {
    compact = false,
    statusFilterAvailable = true,
    eventTypes,
    statusFilter,
    onChange,
  }: Props = $props();

  const open = writable(false);

  const defaultOptions = $derived(
    compact
      ? compactEventTypeOptions.map((o) => o.value)
      : allEventTypeOptions.map((o) => o.value),
  );

  const options = $derived.by(() => {
    let list = (compact ? compactEventTypeOptions : allEventTypeOptions).map(
      (o) => ({
        ...o,
        label: translate(o.label),
        icon: CategoryIcon[o.value],
        description: o.description ? translate(o.description) : '',
      }),
    );
    if (isVersionNewer('1.21.0', $temporalVersion)) {
      list = list.filter(({ value }) => value !== 'update');
    }
    if (!nexusEnabled(page.data.systemInfo?.capabilities)) {
      list = list.filter(({ value }) => value !== 'nexus');
    }
    return list;
  });

  const onOptionClick = ({ value }: (typeof options)[number]) => {
    const newEventTypes = eventTypes.some((type) => type === value)
      ? eventTypes.filter((type) => type !== value)
      : [...eventTypes, value];
    onChange({
      eventTypes: newEventTypes,
      statusFilter,
      allEventTypes: newEventTypes.length === defaultOptions.length,
    });
  };

  const onAllClick = () => {
    onChange({
      eventTypes: defaultOptions,
      statusFilter: false,
      allEventTypes: true,
    });
  };

  const onPendingClick = () => {
    onChange({
      eventTypes: defaultOptions,
      statusFilter: !statusFilter,
      allEventTypes: true,
    });
  };

  const onNoneClick = () => {
    onChange({ eventTypes: [], statusFilter: false, allEventTypes: false });
  };

  const filterActive = $derived(
    (statusFilter && statusFilterAvailable) ||
      eventTypes.length < defaultOptions.length,
  );
</script>

<MenuContainer {open}>
  <MenuButton
    controls="event-type-filter"
    size="sm"
    variant="tertiary"
    class="rounded-none"
  >
    {#snippet leading()}
      <div
        class="flex h-6 w-6 flex-col items-center justify-center rounded-full transition-colors duration-200"
        class:bg-interactive-primary={filterActive}
      >
        <IconFilter class={filterActive ? 'pt-0.5 text-white' : undefined} />
      </div>
    {/snippet}
    <span class="hidden text-sm md:block">{translate('common.filter')}</span>
  </MenuButton>
  <Menu
    id="event-type-filter"
    keepOpen
    usePortal
    position="right"
    class="w-[220px] min-w-0 md:w-[360px]"
  >
    <MenuItem data-testid={translate('common.all')} onclick={onAllClick}>
      {#snippet leading()}
        <Checkbox
          onChange={onAllClick}
          checked={!statusFilter && eventTypes.length === defaultOptions.length}
          label={translate('common.all')}
          labelHidden
          class="mt-px"
        />
      {/snippet}
      {translate('common.all')}
    </MenuItem>
    {#if statusFilterAvailable}
      <MenuItem
        data-testid={translate('common.pending-and-failed')}
        description={translate('common.pending-and-failed-description')}
        onclick={onPendingClick}
        class="items-start"
      >
        {#snippet leading()}
          <Checkbox
            onChange={onPendingClick}
            checked={statusFilter}
            label={translate('common.pending-and-failed')}
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
          onChange={onNoneClick}
          checked={!statusFilter && !eventTypes.length}
          label={translate('common.none')}
          labelHidden
          class="mt-px"
        />
      {/snippet}
      {translate('common.none')}
    </MenuItem>
    <MenuDivider />
    {#each options as option (option.value)}
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
            onclick={() => onOptionClick(option)}
            checked={eventTypes.some((type) => type === option.value)}
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
