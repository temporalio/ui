<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';
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
  import type { TimelineEventMarkerGroup } from '$lib/models/event-marker-groups';
  import { clearActiveGroups } from '$lib/stores/active-events';
  import { eventGroupFilter } from '$lib/stores/filters';
  import type { Payload } from '$lib/types';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';

  let { groups }: { groups: TimelineEventMarkerGroup[] } = $props();

  const open = writable(false);
  let search = $state('');
  const decodedLabels = new SvelteMap<string, string>();
  const decodedPayloads = new SvelteMap<string, Payload>();

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
    const groupsToDecode = groups.flatMap((group) => {
      const payload = group.eventGroupMarker.label?.label;
      if (!payload || decodedPayloads.get(group.markerKey) === payload) {
        return [];
      }
      decodedPayloads.set(group.markerKey, payload);
      return [{ group, payload }];
    });
    if (!groupsToDecode.length) return;

    Promise.all(
      groupsToDecode.map(async ({ group, payload }) => {
        try {
          const decoded = await decodePayloadAndParseDataToJSON(payload);
          return {
            key: group.markerKey,
            label: typeof decoded === 'string' && decoded ? decoded : undefined,
            payload,
          };
        } catch {
          return { key: group.markerKey, label: undefined, payload };
        }
      }),
    ).then((results) => {
      for (const { key, label, payload } of results) {
        if (decodedPayloads.get(key) !== payload) continue;
        if (label) decodedLabels.set(key, label);
        else decodedLabels.delete(key);
      }
    });
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
    disabled={!groups.length && !$eventGroupFilter.length}
    hasIndicator
    size="sm"
    class="border-l-0"
  >
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
        Icon={IconSearch}
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
