<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';
  import { writable } from 'svelte/store';

  import { untrack } from 'svelte';

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

  import { limitEventGroupFilterOptions } from './event-group-filter';

  let { markers }: { markers: EventGroupMarkerDescriptor[] } = $props();

  const DECODE_CONCURRENCY = 4;

  const open = writable(false);
  let search = $state('');
  const decodedLabels = new SvelteMap<string, string>();
  const decodedPayloads = new SvelteMap<string, Payload>();

  const labelFor = (marker: EventGroupMarkerDescriptor): string =>
    decodedLabels.get(marker.markerKey) ?? marker.displayName;

  const matchingOptions = $derived.by(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return markers;
    return markers.filter((marker) =>
      labelFor(marker).toLocaleLowerCase().includes(query),
    );
  });

  const visibleOptions = $derived(
    limitEventGroupFilterOptions(matchingOptions, new Set($eventGroupFilter)),
  );

  const hasMoreOptions = $derived(
    matchingOptions.length > visibleOptions.length,
  );

  type MarkerToDecode = {
    marker: EventGroupMarkerDescriptor;
    payload: Payload;
  };

  const decodeMarkers = async (
    markersToDecode: MarkerToDecode[],
    isActive: () => boolean,
  ) => {
    let nextIndex = 0;

    const worker = async () => {
      while (isActive() && nextIndex < markersToDecode.length) {
        const index = nextIndex++;
        const { marker, payload } = markersToDecode[index];
        decodedPayloads.set(marker.markerKey, payload);
        let label: string | undefined;
        try {
          const decoded = await decodePayloadAndParseDataToJSON(payload);
          label = typeof decoded === 'string' && decoded ? decoded : undefined;
        } catch {
          label = undefined;
        }

        if (decodedPayloads.get(marker.markerKey) !== payload) continue;
        if (label) decodedLabels.set(marker.markerKey, label);
        else decodedLabels.delete(marker.markerKey);
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(DECODE_CONCURRENCY, markersToDecode.length) },
        worker,
      ),
    );
  };

  $effect(() => {
    if (!$open) return;
    const currentMarkers = markers;
    const markersToDecode = untrack(() =>
      currentMarkers.flatMap((marker) => {
        const payload = marker.eventGroupMarker.label?.label;
        if (!payload || decodedPayloads.get(marker.markerKey) === payload) {
          return [];
        }
        return [{ marker, payload }];
      }),
    );
    if (!markersToDecode.length) return;

    let active = true;
    void decodeMarkers(markersToDecode, () => active);
    return () => {
      active = false;
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
    disabled={!markers.length && !$eventGroupFilter.length}
    hasIndicator
    size="sm"
    variant="tertiary"
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
    class="w-[280px] min-w-0 max-w-[calc(100dvw-1rem)] md:w-[380px]"
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
    {#if matchingOptions.length}
      {#each visibleOptions as marker (marker.markerKey)}
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
            <span class="min-w-0 flex-1 whitespace-normal break-words"
              >{label}</span
            >
            <span class="shrink-0 text-xs text-secondary">
              {marker.eventCount}
            </span>
          </div>
        </MenuItem>
      {/each}
      {#if hasMoreOptions}
        <li
          role="none"
          class="surface-primary sticky bottom-0 px-3 py-2 text-center text-xs text-secondary"
        >
          {translate('workflows.event-group-filter-more-results')}
        </li>
      {/if}
    {:else}
      <li role="none" class="px-3 py-4 text-center text-sm text-secondary">
        {translate('common.no-results')}
      </li>
    {/if}
  </Menu>
</MenuContainer>
