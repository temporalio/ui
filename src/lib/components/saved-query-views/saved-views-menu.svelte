<script lang="ts">
  import { writable } from 'svelte/store';

  import { twMerge as merge } from 'tailwind-merge';

  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { IconBookmark, IconSearch } from '$lib/io/icon';
  import type { SavedQuery } from '$lib/stores/saved-queries';

  interface Props {
    id: string;
    views: SavedQuery[];
    activeView?: SavedQuery;
    draftView?: SavedQuery;
    dirty?: boolean;
    maxQueries: number;
    onSelect: (view: SavedQuery) => void;
  }

  let {
    id,
    views,
    activeView,
    draftView,
    dirty = false,
    maxQueries,
    onSelect,
  }: Props = $props();

  const menuId = $derived(`${id}-saved-views-menu`);
  const searchId = $derived(`${id}-saved-views-search`);

  const open = writable(false);
  let search = $state('');

  const filteredViews = $derived.by(() => {
    const term = search.trim().toLowerCase();
    return term
      ? views.filter((view) => view.name.toLowerCase().includes(term))
      : views;
  });

  const activeUserView = $derived(
    activeView?.type === 'user' ? activeView : undefined,
  );
  const draftActive = $derived(
    Boolean(draftView) && activeView?.id === draftView?.id,
  );
  const noneSelected = $derived(!activeUserView && !draftActive);
  const label = $derived(
    draftActive
      ? (draftView?.name ?? '')
      : (activeUserView?.name ?? translate('common.saved-views')),
  );
  const unsaved = $derived(draftActive || (Boolean(activeUserView) && dirty));

  const focusSearch = () => {
    requestAnimationFrame(() => document.getElementById(searchId)?.focus());
  };

  const focusFirstView = () => {
    document
      .querySelector<HTMLElement>(
        `#${menuId} [data-view-item]:not([aria-disabled='true'])`,
      )
      ?.focus();
  };

  $effect(() => {
    if (!$open) search = '';
  });

  const handleSearchKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusFirstView();
    } else if (event.key === 'Escape') {
      $open = false;
    }
  };
</script>

<MenuContainer {open} class="min-w-0">
  <MenuButton
    id="{id}-saved-views-button"
    controls={menuId}
    variant="secondary"
    size="xs"
    hasIndicator
    title={label}
    class={merge('max-w-full', unsaved && 'border-dashed')}
    data-testid="saved-views-button"
    onclick={(isOpen) => {
      if (isOpen) focusSearch();
    }}
  >
    {#snippet leading()}
      {@const Glyph = activeUserView?.Icon ?? IconBookmark}
      <Glyph class={merge('size-4 shrink-0', draftActive && 'opacity-60')} />
    {/snippet}
    <span
      class={merge(
        'min-w-0 truncate font-normal',
        draftActive && 'pr-0.5 italic',
      )}
    >
      {label}
    </span>
    {#if noneSelected}
      <span
        class="surface-subtle ml-1.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-medium"
      >
        {views.length}/{maxQueries}
      </span>
    {:else if unsaved && !draftActive}
      <span
        class="surface-subtle ml-1.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium italic"
      >
        {translate('common.unsaved')}
      </span>
    {/if}
  </MenuButton>

  <Menu id={menuId} class="w-max min-w-full max-w-[32rem]">
    <MenuItem
      class="p-0"
      hoverable={false}
      onclick={() => document.getElementById(searchId)?.focus()}
    >
      <Input
        id={searchId}
        label={translate('common.search')}
        labelHidden
        noBorder
        bind:value={search}
        Icon={IconSearch}
        placeholder={translate('common.search-views')}
        class="w-full"
        onkeydown={handleSearchKeydown}
      />
    </MenuItem>
    <MenuDivider />

    {#if draftView}
      <MenuItem
        selected={draftActive}
        hoverable={false}
        data-testid="draft-view-item"
      >
        <span class="italic">{draftView.name}</span>
      </MenuItem>
      <MenuDivider />
    {/if}

    {#each filteredViews as view (view.id)}
      <MenuItem
        data-view-item
        selected={view.id === activeView?.id}
        onclick={() => onSelect(view)}
        data-testid={view.name.toLowerCase().replace(/\s+/g, '-')}
        data-track-name="user-query-menu-item"
      >
        <span class="min-w-0 break-words">{view.name}</span>
      </MenuItem>
    {:else}
      <MenuItem disabled class="whitespace-nowrap">
        {views.length === 0
          ? translate('common.no-saved-views')
          : translate('common.no-results')}
      </MenuItem>
    {/each}

    <MenuDivider />

    <li role="presentation" class="px-3 py-2 text-xs text-secondary">
      {translate('common.views-used', {
        used: views.length,
        total: maxQueries,
      })}
    </li>
  </Menu>
</MenuContainer>
