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
  import type { EventGroupMarkerDescriptor } from '$lib/models/event-marker-groups';
  import { clearActiveGroups } from '$lib/stores/active-events';
  import { eventGroupFilter } from '$lib/stores/filters';
  import type { Payload } from '$lib/types';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';

  let { markers }: { markers: EventGroupMarkerDescriptor[] } = $props();

  const open = writable(false);
  let search = $state('');
  const decodedLabels = new SvelteMap<string, string>();
  const decodedPayloads = new SvelteMap<string, Payload>();

  const labelFor = (marker: EventGroupMarkerDescriptor): string =>
    decodedLabels.get(marker.markerKey) ?? marker.displayName;

  const options = $derived.by(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return markers;
    return markers.filter((marker) =>
      labelFor(marker).toLocaleLowerCase().includes(query),
    );
  });

  $effect(() => {
    if (!$open) return;
    const markersToDecode = markers.flatMap((marker) => {
      const payload = marker.eventGroupMarker.label?.label;
      if (!payload || decodedPayloads.get(marker.markerKey) === payload) {
        return [];
      }
      decodedPayloads.set(marker.markerKey, payload);
      return [{ marker, payload }];
    });
    if (!markersToDecode.length) return;

    Promise.all(
      markersToDecode.map(async ({ marker, payload }) => {
        try {
          const decoded = await decodePayloadAndParseDataToJSON(payload);
          return {
            key: marker.markerKey,
            label: typeof decoded === 'string' && decoded ? decoded : undefined,
            payload,
          };
        } catch {
          return { key: marker.markerKey, label: undefined, payload };
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
    disabled={!markers.length && !$eventGroupFilter.length}
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
      {#each options as marker (marker.markerKey)}
        {@const label = labelFor(marker)}
        <MenuItem onclick={() => toggle(marker.markerKey)} class="min-w-0">
          {#snippet leading()}
            <Checkbox
              onclick={() => toggle(marker.markerKey)}
              checked={$eventGroupFilter.includes(marker.markerKey)}
              {label}
              labelHidden
            />
          {/snippet}
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <span class="min-w-0 flex-1 truncate" title={label}>{label}</span>
            <span class="shrink-0 text-xs text-secondary">
              {marker.eventCount}
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
