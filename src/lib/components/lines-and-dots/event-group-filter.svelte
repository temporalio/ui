<script lang="ts">
  import { writable } from 'svelte/store';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { TimelineEventMarkerGroup } from '$lib/models/event-marker-groups';
  import { getEventMarkerPresentation } from '$lib/services/grouped-event-buffer';
  import { clearActiveGroups } from '$lib/stores/active-events';
  import { eventGroupFilter } from '$lib/stores/filters';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';

  let { groups }: { groups: TimelineEventMarkerGroup[] } = $props();

  const open = writable(false);
  let search = $state('');
  let decodedLabels = $state.raw(new Map<string, string>());

  const labelFor = (group: TimelineEventMarkerGroup): string =>
    decodedLabels.get(group.markerKey) ?? group.displayName;

  const options = $derived.by(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return groups;
    return groups.filter((group) =>
      labelFor(group).toLocaleLowerCase().includes(query),
    );
  });

  $effect(() => {
    if (!$open) return;
    const currentGroups = groups;
    let cancelled = false;

    Promise.all(
      currentGroups.map(async (group) => {
        const payload = group.eventGroupMarker.label?.label;
        if (!payload) return [group.markerKey, group.displayName] as const;
        try {
          const decoded = await decodePayloadAndParseDataToJSON(payload);
          return [
            group.markerKey,
            typeof decoded === 'string' && decoded
              ? decoded
              : group.displayName,
          ] as const;
        } catch {
          return [group.markerKey, group.displayName] as const;
        }
      }),
    ).then((labels) => {
      if (!cancelled) decodedLabels = new Map(labels);
    });

    return () => {
      cancelled = true;
    };
  });

  const setSelection = (next: string[]) => {
    clearActiveGroups();
    $eventGroupFilter = next;
    updateEventFilterParams(
      page.url,
      { eventGroups: next.length ? next : null },
      goto,
    );
  };

  const toggle = (markerKey: string) => {
    setSelection(
      $eventGroupFilter.includes(markerKey)
        ? $eventGroupFilter.filter((key) => key !== markerKey)
        : [...$eventGroupFilter, markerKey],
    );
  };
</script>

<MenuContainer {open} class="z-10">
  <MenuButton
    controls="event-group-filter-menu"
    count={$eventGroupFilter.length}
    disabled={!groups.length}
    hasIndicator
    size="sm"
    class="border-l-0"
  >
    {#snippet leading()}
      <Icon name="compact" />
    {/snippet}
    <span class="hidden text-sm md:block">
      {translate('workflows.event-groups')}
    </span>
  </MenuButton>
  <Menu
    id="event-group-filter-menu"
    keepOpen
    position="right"
    class="w-[280px] md:w-[380px]"
  >
    <li role="none" class="p-2">
      <Input
        id="event-group-filter-search"
        bind:value={search}
        label={translate('common.search')}
        labelHidden
        icon="search"
        type="search"
        placeholder={`${translate('common.search')}…`}
        clearable
        clearButtonLabel={translate('common.clear-input-button-label')}
      />
    </li>
    {#if $eventGroupFilter.length}
      <MenuItem onclick={() => setSelection([])}>
        {translate('common.clear-all')}
      </MenuItem>
      <MenuDivider />
    {/if}
    {#if options.length}
      {#each options as group (group.markerKey)}
        {@const label = labelFor(group)}
        {@const icon = getEventMarkerPresentation(group.eventGroupMarker)?.icon}
        <MenuItem onclick={() => toggle(group.markerKey)} class="min-w-0">
          {#snippet leading()}
            <Checkbox
              onclick={() => toggle(group.markerKey)}
              checked={$eventGroupFilter.includes(group.markerKey)}
              {label}
              labelHidden
            />
          {/snippet}
          <div class="flex min-w-0 flex-1 items-center gap-2">
            {#if icon}<Icon name={icon} class="shrink-0" />{/if}
            <span class="min-w-0 flex-1 truncate" title={label}>{label}</span>
            <span class="shrink-0 text-xs text-secondary">
              {group.eventList.length}
            </span>
          </div>
        </MenuItem>
      {/each}
    {:else}
      <li role="none" class="px-3 py-4 text-center text-sm text-secondary">
        {translate('common.no-results')}
      </li>
    {/if}
  </Menu>
</MenuContainer>
