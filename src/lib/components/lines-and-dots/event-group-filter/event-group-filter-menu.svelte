<script lang="ts">
  import { writable } from 'svelte/store';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconSearch } from '$lib/io/icon';
  import {
    decodeEventGroupLabel,
    type EventGroupKey,
    type EventGroupLabel,
    formatEventGroupName,
  } from '$lib/models/event-history/event-group-markers';
  import type { EventGroupOption } from '$lib/services/grouped-event-buffer';
  import { clearActiveGroups } from '$lib/stores/active-events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';

  import {
    limitEventGroupOptions,
    matchesEventGroupSearch,
  } from './event-group-filter';

  let { options }: { options: EventGroupOption[] } = $props();

  const DECODE_CONCURRENCY = 4;

  const open = writable(false);
  let search = $state('');
  const decodedLabels = new WeakMap<EventGroupLabel, string>();
  let decodedLabelsVersion = $state(0);

  const selected = $derived(parseEventFilterParams(page.url).eventGroups);
  const selectedKeys = $derived(new Set(selected));
  const appliedCount = $derived(
    options.filter(({ group }) => selectedKeys.has(group.key)).length,
  );

  const labelFor = (option: EventGroupOption): string => {
    void decodedLabelsVersion;
    return (
      decodedLabels.get(option.group) ?? formatEventGroupName(option.group)
    );
  };

  const matchingOptions = $derived(
    options.filter((option) =>
      matchesEventGroupSearch(option, labelFor(option), search),
    ),
  );
  const visibleOptions = $derived(
    limitEventGroupOptions(matchingOptions, selectedKeys),
  );
  const hasMoreOptions = $derived(
    matchingOptions.length > visibleOptions.length,
  );

  const decodeLabels = async (
    labeled: EventGroupOption[],
    isActive: () => boolean,
  ) => {
    let next = 0;
    const worker = async () => {
      while (isActive() && next < labeled.length) {
        const { group } = labeled[next++];
        const label = await decodeEventGroupLabel(group);
        if (isActive() && decodedLabels.get(group) !== label) {
          decodedLabels.set(group, label);
          decodedLabelsVersion++;
        }
      }
    };
    await Promise.all(
      Array.from(
        { length: Math.min(DECODE_CONCURRENCY, labeled.length) },
        worker,
      ),
    );
  };

  $effect(() => {
    if (!$open) return;
    const labeled = options.filter(({ group }) => group.label !== undefined);
    if (!labeled.length) return;

    let active = true;
    void decodeLabels(labeled, () => active);
    return () => {
      active = false;
    };
  });

  const setSelection = (keys: EventGroupKey[]) => {
    clearActiveGroups();
    updateEventFilterParams(
      page.url,
      { eventGroups: keys.length ? keys : null },
      goto,
    );
  };

  const toggle = (key: EventGroupKey) => {
    setSelection(
      selectedKeys.has(key)
        ? selected.filter((selectedKey) => selectedKey !== key)
        : [...selected, key],
    );
  };
</script>

<MenuContainer {open}>
  <MenuButton
    controls="event-group-filter-menu"
    count={appliedCount}
    label={translate('events.event-groups')}
    hasIndicator
    size="sm"
    variant="tertiary"
    class="rounded-none border-l-0"
  >
    <span class="whitespace-nowrap text-sm">
      {translate('events.event-groups')}
    </span>
  </MenuButton>
  <Menu
    id="event-group-filter-menu"
    keepOpen
    position="right"
    class="w-[280px] min-w-0 max-w-[calc(100dvw-1rem)] md:w-[380px]"
  >
    {#if $open}
      <li role="none" class="p-2">
        <Input
          id="event-group-filter-search"
          bind:value={search}
          label={translate('common.search')}
          labelHidden
          Icon={IconSearch}
          type="search"
          placeholder={`${translate('common.search')}…`}
          clearable
          clearButtonLabel={translate('common.clear-input-button-label')}
        />
      </li>
      {#if selected.length}
        <MenuItem onclick={() => setSelection([])}>
          {translate('common.clear-all')}
        </MenuItem>
        <MenuDivider />
      {/if}
      {#if matchingOptions.length}
        {#each visibleOptions as option (option.group.key)}
          {@const label = labelFor(option)}
          <MenuItem onclick={() => toggle(option.group.key)} class="min-w-0">
            {#snippet leading()}
              <Checkbox
                onclick={() => toggle(option.group.key)}
                checked={selectedKeys.has(option.group.key)}
                {label}
                labelHidden
              />
            {/snippet}
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span class="min-w-0 flex-1 whitespace-normal break-words"
                >{label}</span
              >
              <span class="shrink-0 text-xs text-secondary">
                {option.eventCount}
              </span>
            </div>
          </MenuItem>
        {/each}
        {#if hasMoreOptions}
          <li
            role="none"
            class="sticky bottom-0 z-10 border-t border-secondary bg-surface-primary px-3 py-2 text-center text-xs text-secondary"
          >
            {translate('events.event-group-filter-more-results', {
              shown: visibleOptions.length,
              total: matchingOptions.length,
            })}
          </li>
        {/if}
      {:else}
        <li role="none" class="px-3 py-4 text-center text-sm text-secondary">
          {translate('common.no-results')}
        </li>
      {/if}
    {/if}
  </Menu>
</MenuContainer>
