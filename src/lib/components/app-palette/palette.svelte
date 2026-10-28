<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { prefersReducedMotion } from 'svelte/motion';
  import { MediaQuery } from 'svelte/reactivity';
  import { fade, fly } from 'svelte/transition';

  import { onDestroy } from 'svelte';

  import { page } from '$app/state';

  import { translate } from '$lib/i18n/translate';
  import { IconClose, IconEllipsisVertical } from '$lib/io/icon';
  import { toaster } from '$lib/stores/toaster';

  import { filterPaletteItems } from './filter';
  import { IS_MAC, MOD } from './keys';
  import {
    loadRecent,
    recencyBoost,
    type RecentUse,
    recordUse,
    saveRecent,
  } from './recent';
  import {
    groupIntoSections,
    type PaletteEntry,
    type PaletteSection,
    rootItems,
    rootVariant,
    searchItems,
    uniqueById,
  } from './root-items';
  import { matchesRules } from './rules';
  import { nextScope, scopedToolSets, setForKey } from './scope';
  import { subjectFromParams } from './subject';
  import type {
    PaletteAction,
    PaletteContext,
    PaletteFacts,
    PaletteItem,
    PaletteStatusVariant,
    PaletteTone,
    PaletteToolSet,
    PaletteVariant,
    PaletteView,
  } from './types';

  interface Props {
    toolSets: PaletteToolSet[];
    label?: string;
    // Bind it to open the palette from a button or a menu.
    open?: boolean;
    // Local storage key for recently used items.
    recentKey?: string;
    // Checked against item rules in pushed views. Root items are already
    // filtered by the app. Without facts, view items are not filtered.
    facts?: PaletteFacts;
  }

  let {
    toolSets,
    label: labelProp,
    open = $bindable(false),
    recentKey = 'palette-recent',
    facts,
  }: Props = $props();

  const uid = $props.id();
  const listboxId = `${uid}-list`;
  const menuId = `${uid}-actions`;
  const pickerId = `${uid}-scopes`;

  const STATUS_MS = 5000;
  const RECENT_LIMIT = 5;

  const label = $derived(labelProp ?? translate('palette.label'));
  const pageSection = $derived(translate('palette.on-this-page'));

  const DEV_TAG =
    'shrink-0 rounded bg-[#facc15] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#171717]';

  interface Frame {
    view: PaletteView;
    variant: PaletteVariant;
  }

  // The item and action are captured when the confirm opens, so the action
  // that runs is the one the user confirmed, even if the list changes.
  interface PendingConfirm {
    itemId: string;
    actionIndex: number;
    message: string;
    item: PaletteItem;
    action: PaletteAction;
  }

  interface Status {
    message: string;
    variant: PaletteStatusVariant;
    link?: string;
  }

  let frames = $state.raw<Frame[]>([]);
  let query = $state('');
  let selected = $state(0);
  let actionsOpen = $state(false);
  // The item whose actions menu is open, captured when the menu opens.
  let actionsItem = $state.raw<PaletteItem | null>(null);
  let actionSelected = $state(0);
  let pendingConfirm = $state<PendingConfirm | null>(null);
  let status = $state<Status | null>(null);
  let running = $state(false);
  let scope = $state<string | null>(null);
  let pickerOpen = $state(false);
  let recent = $state.raw<RecentUse[]>([]);
  let openedAt = $state(0);
  // Increases on every close. A context from an earlier session does nothing,
  // so an action that finishes after a close cannot change the next session.
  let session = 0;

  // Touch screens get visible row action buttons and no key hints.
  const coarse = new MediaQuery('pointer: coarse');

  let input = $state<HTMLInputElement>();
  // A click closes the palette only when it also started on the backdrop, so
  // a text selection dragged out of the panel does not close it.
  let pressedBackdrop = false;
  let returnFocus: Element | null = null;
  let statusTimer: ReturnType<typeof setTimeout> | undefined;
  const savedFrames: { query: string; selected: number }[] = [];

  const canScope = $derived(toolSets.length > 1);
  const scopedSet = $derived(toolSets.find(({ id }) => id === scope));
  const activeSets = $derived(scopedToolSets(toolSets, scope));

  const currentFrame = $derived(frames.at(-1));
  const currentView = $derived(currentFrame?.view);
  const activeVariant = $derived(
    currentFrame?.variant ?? rootVariant(activeSets),
  );
  const isDev = $derived(activeVariant === 'dev');

  function contextFor(variant: PaletteVariant): PaletteContext {
    const owner = session;
    const live = () => owner === session;
    return {
      push: (view) => live() && push(view, variant),
      pop: () => live() && pop(),
      close: () => live() && close(),
      toast: showStatus,
      namespace: () => page.params.namespace,
      subject: () => subjectFromParams(page.params, page.route.id),
    };
  }

  function allowed(items: PaletteItem[]): PaletteItem[] {
    if (!facts) return items;
    return items.filter(({ rules }) => matchesRules(rules, facts));
  }

  const rootEntries = $derived(
    currentView ? [] : rootItems(activeSets, contextFor, pageSection),
  );
  const queryEntries = $derived(
    currentView ? [] : searchItems(activeSets, query, contextFor, pageSection),
  );
  const rootVariants = $derived(
    new Map(
      [...rootEntries, ...queryEntries].map(({ item, variant }) => [
        item.id,
        variant,
      ]),
    ),
  );
  // Only items from the list itself are saved as recent. Query items, such
  // as a pasted ID, and page items are not.
  const recordableIds = $derived(
    new Set(rootEntries.filter(({ page }) => !page).map(({ item }) => item.id)),
  );

  // Recent items, then page items, then every item in its natural order.
  // Recent items also keep their place in the list, so the list below
  // them never reorders.
  function rootSections(entries: PaletteEntry[]): PaletteSection[] {
    const byId = new Map(entries.map((entry) => [entry.item.id, entry]));
    const recentEntries = recent
      .flatMap(({ id }) => {
        const entry = byId.get(id);
        return entry && !entry.page ? [entry] : [];
      })
      .slice(0, RECENT_LIMIT);

    // Page and recent items mix sets under one heading. Dev rows keep
    // their own marker.
    return groupIntoSections([
      ...recentEntries.map((entry) => ({
        ...entry,
        section: translate('palette.recent'),
        variant: 'default' as const,
      })),
      ...entries
        .filter(({ page }) => page)
        .map((entry) => ({ ...entry, variant: 'default' as const })),
      ...entries.filter(({ page }) => !page),
    ]);
  }

  const sections = $derived.by((): PaletteSection[] => {
    if (currentView) {
      const trimmed = query.trim();
      const typed = trimmed ? (currentView.search?.(trimmed) ?? []) : [];
      return [
        {
          title: '',
          variant: activeVariant,
          items: uniqueById(
            allowed([
              ...typed,
              ...filterPaletteItems(currentView.items(), query),
            ]),
          ),
        },
      ];
    }
    if (!query.trim()) return rootSections(rootEntries);
    return [
      {
        title: '',
        variant: 'default',
        items: uniqueById([
          ...queryEntries
            .filter(({ fallback }) => !fallback)
            .map(({ item }) => item),
          ...filterPaletteItems(
            rootEntries.map(({ item }) => item),
            query,
            (item) => recencyBoost(recent, item.id, openedAt),
          ),
          ...queryEntries
            .filter(({ fallback }) => fallback)
            .map(({ item }) => item),
        ]),
      },
    ];
  });

  const visibleItems = $derived(sections.flatMap(({ items }) => items));
  // Icons get a column only when some item has one, so plain lists such as
  // a flag list keep their full width.
  const showIcons = $derived(visibleItems.some(({ icon }) => icon));
  // An item can show in two sections, so rows are indexed by position.
  const sectionStarts = $derived(
    sections.reduce<number[]>(
      (starts, section, index) => [
        ...starts,
        index === 0 ? 0 : starts[index - 1] + sections[index - 1].items.length,
      ],
      [],
    ),
  );
  const selectedIndex = $derived(
    Math.min(selected, Math.max(visibleItems.length - 1, 0)),
  );
  const selectedItem = $derived(visibleItems[selectedIndex]);
  const menuItem = $derived(actionsOpen ? actionsItem : null);
  const loading = $derived(currentView?.loading?.() ?? false);
  const error = $derived(currentView?.error?.());
  const breadcrumbs = $derived(frames.map(({ view }) => view.title));
  const scopeIsDev = $derived(
    scopedSet ? scopedSet.variant === 'dev' : rootVariant(toolSets) === 'dev',
  );
  const scopeLabel = $derived(
    scopeIsDev
      ? translate('palette.dev-tools')
      : (scopedSet?.label ?? translate('palette.all')),
  );

  // Read by screen readers after each change to the list or the scope.
  const announcement = $derived.by(() => {
    if (!open || loading) return '';
    const results = translate('palette.result-count', {
      count: visibleItems.length,
    });
    if (!scopedSet || frames.length > 0) return results;
    return `${translate('palette.scoped-to', { scope: scopeLabel })}. ${results}`;
  });

  // Confirms, footer messages and the result count all go through one live
  // region. It is written after it renders, because screen readers often
  // skip a region that appears with its text already in it.
  const liveMessage = $derived(
    pendingConfirm?.message ?? status?.message ?? announcement,
  );
  // Not a derived value: the region must render empty first and get its text
  // one tick later.
  // eslint-disable-next-line svelte/prefer-writable-derived
  let spoken = $state('');

  $effect(function speak() {
    spoken = open ? liveMessage : '';
  });

  function optionId(index: number) {
    return `${uid}-option-${index}`;
  }

  function actionId(index: number) {
    return `${uid}-action-${index}`;
  }

  function variantOf(item: PaletteItem): PaletteVariant {
    return currentFrame?.variant ?? rootVariants.get(item.id) ?? 'default';
  }

  // Marks dev items when the palette as a whole is not dev-styled.
  function showsDevMarker(item: PaletteItem) {
    return !isDev && variantOf(item) === 'dev';
  }

  function showStatus(
    message: string,
    variant: PaletteStatusVariant = 'info',
    link?: string,
  ) {
    if (!open) {
      toaster.push({ message, variant, link });
      return;
    }
    status = { message, variant, link };
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status = null), STATUS_MS);
  }

  function show() {
    open = true;
  }

  function resetTransientState() {
    actionsOpen = false;
    actionsItem = null;
    actionSelected = 0;
    pendingConfirm = null;
    pickerOpen = false;
  }

  function setScope(next: string | null) {
    scope = next;
    query = '';
    selected = 0;
    resetTransientState();
  }

  function push(view: PaletteView, variant: PaletteVariant) {
    savedFrames.push({ query, selected: selectedIndex });
    frames = [...frames, { view, variant }];
    query = '';
    selected = 0;
    resetTransientState();
    view.onOpen?.();
  }

  function pop() {
    const top = frames.at(-1);
    if (!top) {
      close();
      return;
    }

    top.view.onClose?.();
    frames = frames.slice(0, -1);
    const frame = savedFrames.pop();
    query = frame?.query ?? '';
    selected = frame?.selected ?? 0;
    resetTransientState();
  }

  function close() {
    session += 1;
    running = false;
    for (const { view } of [...frames].reverse()) view.onClose?.();
    frames = [];
    savedFrames.length = 0;
    query = '';
    selected = 0;
    resetTransientState();
    clearTimeout(statusTimer);
    status = null;
    scope = null;
    open = false;
  }

  function isPending(itemId: string, actionIndex: number) {
    return (
      pendingConfirm?.itemId === itemId &&
      pendingConfirm.actionIndex === actionIndex
    );
  }

  function runAction(item: PaletteItem | null | undefined, index: number) {
    if (!item) return;
    if (running) {
      showStatus(translate('palette.still-working'));
      return;
    }
    if (item.disabled) {
      showStatus(item.disabled);
      return;
    }

    const action = item.actions[index];
    if (!action) return;
    if (action.disabled) {
      showStatus(action.disabled);
      return;
    }

    actionsOpen = false;
    actionsItem = null;
    if (action.confirm && !isPending(item.id, index)) {
      pendingConfirm = {
        itemId: item.id,
        actionIndex: index,
        message: action.confirm,
        item,
        action,
      };
      return;
    }

    pendingConfirm = null;
    perform(item, action);
  }

  async function perform(item: PaletteItem, action: PaletteAction) {
    // Saved for the next open. The open list keeps its order, so the
    // selection does not jump.
    if (frames.length === 0 && recordableIds.has(item.id)) {
      saveRecent(
        recentKey,
        recordUse(loadRecent(recentKey), item.id, Date.now()),
      );
    }
    const owner = session;
    running = true;
    try {
      await action.run(contextFor(variantOf(item)));
    } catch (err) {
      showStatus(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      if (owner === session) running = false;
    }
  }

  function confirmPending() {
    const pending = pendingConfirm;
    if (!pending) return;
    if (running) {
      showStatus(translate('palette.still-working'));
      return;
    }

    pendingConfirm = null;
    perform(pending.item, pending.action);
  }

  function toggleActions() {
    if (actionsOpen) {
      actionsOpen = false;
      actionsItem = null;
      return;
    }
    if (!selectedItem || selectedItem.disabled) return;
    if (selectedItem.actions.length === 0) return;

    pendingConfirm = null;
    actionSelected = 0;
    actionsItem = selectedItem;
    actionsOpen = true;
  }

  function select(index: number) {
    if (actionsOpen || index === selectedIndex) return;
    selected = index;
    pendingConfirm = null;
  }

  function move(delta: number) {
    if (menuItem) {
      const count = menuItem.actions.length;
      if (count === 0) return;
      actionSelected = (actionSelected + delta + count) % count;
      return;
    }

    const count = visibleItems.length;
    if (count === 0) return;
    pendingConfirm = null;
    selected = (selectedIndex + delta + count) % count;
  }

  function hasMod(event: KeyboardEvent) {
    return IS_MAC ? event.metaKey : event.ctrlKey;
  }

  // Non-Latin layouts report another letter for K, so the physical key also
  // counts. Latin layouts such as Dvorak keep their own K.
  function isK(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key === 'k') return true;
    return !/^[a-z]$/.test(key) && event.code === 'KeyK';
  }

  // Runs in the capture phase, so Mod+K always opens the palette, even in a
  // field that handles its own keys.
  function onWindowKeydown(event: KeyboardEvent) {
    if (!hasMod(event) || !isK(event)) return;
    event.preventDefault();
    if (open) {
      toggleActions();
      return;
    }
    show();
  }

  // Esc undoes the innermost thing first: picker, confirm, actions, view.
  function handleEscape() {
    if (pickerOpen) {
      pickerOpen = false;
      return;
    }
    if (pendingConfirm) {
      pendingConfirm = null;
      return;
    }
    if (actionsOpen) {
      actionsOpen = false;
      return;
    }
    if (frames.length > 0) {
      pop();
      return;
    }
    close();
  }

  function handleEnter(event: KeyboardEvent) {
    event.preventDefault();
    if (pendingConfirm) {
      confirmPending();
      return;
    }
    if (actionsOpen) {
      runAction(menuItem, actionSelected);
      return;
    }
    runAction(selectedItem, hasMod(event) ? 1 : 0);
  }

  // Backspace on an empty query leaves the view first, then the scope.
  function handleBackspace(event: KeyboardEvent) {
    if (query !== '' || actionsOpen) return;
    if (frames.length > 0) {
      event.preventDefault();
      pop();
      return;
    }
    if (!scope) return;
    event.preventDefault();
    setScope(null);
  }

  function handleSpace(event: KeyboardEvent) {
    if (frames.length > 0 || !canScope) return;
    const toolSet = setForKey(toolSets, query);
    if (!toolSet) return;
    event.preventDefault();
    setScope(toolSet.id);
  }

  // Tab cycles the scope only while the query is empty. With text in the
  // query, Tab moves focus to the scope chip and the close button.
  function handleTab(event: KeyboardEvent) {
    if (frames.length > 0 || !canScope || query !== '') return;
    event.preventDefault();
    setScope(nextScope(toolSets, scope, event.shiftKey ? -1 : 1));
  }

  function onInputKeydown(event: KeyboardEvent) {
    // Keys that commit or move inside an IME composition belong to the IME.
    if (event.isComposing) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        return;
      case 'Enter':
        handleEnter(event);
        return;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        handleEscape();
        return;
      case 'Backspace':
        handleBackspace(event);
        return;
      case ' ':
        handleSpace(event);
        return;
      case 'Tab':
        handleTab(event);
        return;
    }
  }

  function onInput() {
    selected = 0;
    resetTransientState();
  }

  // Rows and buttons never take focus, so the keyboard keeps working after
  // a click.
  function keepInputFocus(event: MouseEvent) {
    event.preventDefault();
  }

  function openActionsFor(index: number) {
    if (actionsOpen && index === selectedIndex) {
      actionsOpen = false;
      return;
    }
    actionsOpen = false;
    selected = index;
    toggleActions();
  }

  // An opener inside a menu is hidden once the menu closes, so focus goes to
  // the button that controls that menu.
  function restoreFocus(target: Element | null) {
    if (!(target instanceof HTMLElement) || !target.isConnected) return;
    target.focus();
    if (document.activeElement === target) return;

    const menu = target.closest('[role="menu"], [role="dialog"]');
    if (!menu?.id) return;
    const trigger = [
      ...document.querySelectorAll<HTMLElement>('[aria-controls]'),
    ].find((element) => element.getAttribute('aria-controls') === menu.id);
    trigger?.focus();
  }

  // showModal() traps focus and makes the page behind inert. The palette
  // can open from the hotkey or from a menu, so focus returns to whatever
  // had it.
  function modal(node: HTMLDialogElement) {
    returnFocus = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      restoreFocus(returnFocus);
      returnFocus = null;
    };
  }

  // The app can unmount the palette while it is open, for example when its
  // last tool set goes away. Close it first, so views clean up and it does
  // not open again by itself.
  onDestroy(() => {
    if (open) close();
  });

  $effect(function loadRecentOnOpen() {
    if (!open) return;
    openedAt = Date.now();
    recent = loadRecent(recentKey);
  });

  $effect(function focusInputOnEachView() {
    if (!open) return;
    void frames;
    input?.focus();
  });

  $effect(function keepSelectionVisible() {
    if (!open) return;
    document
      .getElementById(optionId(selectedIndex))
      ?.scrollIntoView({ block: 'nearest' });
  });

  const motion = $derived(
    prefersReducedMotion.current
      ? { duration: 0 }
      : { duration: 200, easing: cubicOut },
  );

  const toneClass: Record<PaletteTone, string> = {
    neutral: 'text-secondary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    information: 'text-information',
    accent: 'text-accent',
    error: 'text-error',
    // Brand blue fails contrast on the selected row, and the label already
    // says what it means.
    brand: 'font-medium text-primary',
  };

  const statusClass: Record<PaletteStatusVariant, string> = {
    success: 'text-success',
    error: 'text-danger',
    info: 'text-primary',
    warning: 'text-warning',
  };
</script>

<!-- Capture, because Holocene buttons stop the propagation of every keydown. -->
<svelte:window onkeydowncapture={onWindowKeydown} />

{#snippet kbd(keys: string)}
  {#if !coarse.current}
    <kbd
      class="rounded border border-secondary bg-surface-secondary px-1.5 py-0.5 font-mono text-xs text-secondary"
      >{keys}</kbd
    >
  {/if}
{/snippet}

{#snippet devMarker()}
  <span class={DEV_TAG} aria-hidden="true">{translate('palette.dev')}</span>
{/snippet}

{#if open}
  <dialog
    {@attach modal}
    aria-label={label}
    class="m-0 h-full max-h-none w-full max-w-none overflow-visible border-0 bg-transparent p-0 backdrop:bg-transparent"
    oncancel={(event) => {
      event.preventDefault();
      handleEscape();
    }}
    onclose={() => open && close()}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 flex items-start justify-center bg-[rgb(0_0_0/0.3)] px-4 pt-4 backdrop-blur-sm sm:pt-[12vh]"
      role="presentation"
      transition:fade={motion}
      onmousedown={(event) =>
        (pressedBackdrop = event.target === event.currentTarget)}
      onclick={(event) => {
        if (!pressedBackdrop || event.target !== event.currentTarget) return;
        close();
      }}
    >
      <div
        transition:fly={{ ...motion, y: 96 }}
        class="w-full max-w-2xl rounded-xl border border-primary shadow-2xl"
      >
        <div
          class="relative flex max-h-[min(560px,76dvh)] flex-col rounded-xl bg-surface-primary"
        >
          <div
            class="flex items-center gap-2 border-b border-secondary px-4 py-3"
          >
            {#each breadcrumbs as crumb, index (index)}
              <span
                class="shrink-0 rounded bg-surface-secondary px-2 py-0.5 text-xs text-secondary"
                >{crumb}</span
              >
            {/each}
            <input
              bind:this={input}
              bind:value={query}
              oninput={onInput}
              onkeydown={onInputKeydown}
              class="min-w-0 flex-1 bg-transparent text-base text-primary outline-none placeholder:text-secondary"
              placeholder={currentView?.placeholder ??
                translate('palette.search-placeholder')}
              role="combobox"
              aria-label={currentView?.title ?? label}
              aria-expanded="true"
              aria-controls={actionsOpen ? menuId : listboxId}
              aria-activedescendant={actionsOpen
                ? actionId(actionSelected)
                : selectedItem
                  ? optionId(selectedIndex)
                  : undefined}
              autocomplete="off"
              spellcheck="false"
            />
            {#if frames.length === 0 && canScope}
              <button
                type="button"
                class={[
                  'flex h-6 shrink-0 items-center gap-1 rounded px-2 text-xs',
                  scopeIsDev
                    ? DEV_TAG
                    : 'bg-surface-secondary font-medium text-secondary hover:text-primary',
                ]}
                aria-label={translate('palette.scope-label', {
                  scope: scopeLabel,
                })}
                aria-haspopup="menu"
                aria-expanded={pickerOpen}
                aria-controls={pickerOpen ? pickerId : undefined}
                onmousedown={keepInputFocus}
                onclick={() => (pickerOpen = !pickerOpen)}
              >
                {scopeLabel}
              </button>
            {:else if isDev}
              <span class={DEV_TAG}>{translate('palette.dev-tools')}</span>
            {/if}
            <button
              type="button"
              class="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-secondary hover:text-primary"
              aria-label={translate('palette.close')}
              onmousedown={keepInputFocus}
              onclick={close}
            >
              <IconClose class="h-4 w-4" />
            </button>
          </div>

          {#if pickerOpen}
            <div
              id={pickerId}
              class="absolute right-10 top-12 z-10 w-64 rounded-lg border border-primary bg-surface-primary p-1 shadow-xl"
              role="menu"
              aria-label={translate('palette.scope')}
            >
              {#each [null, ...toolSets] as toolSet (toolSet?.id ?? 'all')}
                {@const id = toolSet?.id ?? null}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={scope === id}
                  class={[
                    'flex min-h-8 w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-left text-sm text-primary hover:bg-interactive-tertiary-hover',
                    scope === id && 'bg-interactive-tertiary-hover',
                  ]}
                  onmousedown={keepInputFocus}
                  onclick={() => setScope(id)}
                >
                  <span class="flex items-center gap-2">
                    {toolSet?.label ?? translate('palette.all')}
                    {#if toolSet?.variant === 'dev'}
                      {@render devMarker()}
                    {/if}
                  </span>
                  {#if toolSet}
                    {@render kbd(`${toolSet.key} ␣`)}
                  {:else}
                    {@render kbd('⌫')}
                  {/if}
                </button>
              {/each}
              {#if !coarse.current}
                <p class="px-3 pb-1 pt-2 text-xs text-secondary">
                  {translate('palette.scope-hint')}
                </p>
              {/if}
            </div>
          {/if}

          <!-- Keyboard users can focus it to scroll (axe scrollable-region-focusable). Rows are reached from the input. -->
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div class="min-h-72 flex-1 overflow-y-auto p-2" tabindex="0">
            {#if loading}
              <p class="px-3 py-2 text-sm text-secondary" role="status">
                {translate('palette.loading')}
              </p>
            {/if}
            {#if error}
              <p class="px-3 py-2 text-sm text-danger" role="alert">{error}</p>
            {/if}
            {#if !loading && visibleItems.length === 0}
              <p class="px-3 py-2 text-sm text-secondary" role="status">
                {query
                  ? translate('palette.no-matches')
                  : (currentView?.emptyText ?? translate('palette.empty'))}
              </p>
            {/if}
            <div id={listboxId} role="listbox" aria-label={label}>
              {#each sections as section, sectionIndex (sectionIndex)}
                {#if section.title}
                  <div
                    class="flex items-center gap-2 px-3 pb-1.5 pt-4 text-xs font-medium text-secondary first:pt-1"
                    role="presentation"
                  >
                    {section.title}
                    {#if !isDev && section.variant === 'dev'}
                      {@render devMarker()}
                    {/if}
                  </div>
                {/if}
                {#each section.items as item, itemIndex (itemIndex)}
                  {@const index = sectionStarts[sectionIndex] + itemIndex}
                  {@const isSelected = index === selectedIndex}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <div
                    id={optionId(index)}
                    role="option"
                    tabindex="-1"
                    aria-selected={isSelected}
                    aria-disabled={Boolean(item.disabled)}
                    class={[
                      'flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
                      isSelected && 'bg-interactive-tertiary-hover',
                      item.disabled && 'opacity-60',
                    ]}
                    onmousedown={keepInputFocus}
                    onmousemove={() => select(index)}
                    onclick={() => runAction(item, 0)}
                  >
                    {#if showIcons}
                      {@const Icon = item.icon}
                      <span
                        class="flex h-6 w-6 shrink-0 items-center justify-center text-secondary"
                        aria-hidden="true"
                      >
                        {#if Icon}
                          <Icon class="h-4 w-4" />
                        {/if}
                      </span>
                    {/if}
                    <div class="flex min-w-0 flex-1 items-baseline gap-2">
                      <span
                        class="max-w-full shrink-0 truncate text-sm text-primary"
                      >
                        {item.title}
                      </span>
                      {#if item.subtitle || item.disabled}
                        <span class="min-w-0 truncate text-sm text-secondary">
                          {item.disabled ?? item.subtitle}
                        </span>
                      {/if}
                    </div>
                    {#if section.variant !== 'dev' && showsDevMarker(item)}
                      {@render devMarker()}
                    {/if}
                    {#if item.accessory}
                      <span
                        class={[
                          'shrink-0 text-xs',
                          toneClass[item.accessory.tone ?? 'neutral'],
                        ]}>{item.accessory.label}</span
                      >
                    {/if}
                    {#if item.actions.length > 1 && !item.disabled && (coarse.current || isSelected)}
                      <!-- Keyboard users press Mod+K. Screen readers on touch screens use this button. -->
                      <button
                        type="button"
                        tabindex="-1"
                        aria-label={translate('palette.actions-for', {
                          item: item.title,
                        })}
                        class="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-secondary hover:text-primary"
                        onmousedown={keepInputFocus}
                        onclick={(event) => {
                          event.stopPropagation();
                          openActionsFor(index);
                        }}
                      >
                        <IconEllipsisVertical class="h-4 w-4" />
                      </button>
                    {/if}
                  </div>
                {/each}
              {/each}
            </div>
          </div>

          {#if menuItem}
            <div
              id={menuId}
              class="absolute bottom-12 right-3 max-h-64 w-72 overflow-y-auto rounded-lg border border-primary bg-surface-primary p-1 shadow-xl"
              role="menu"
              aria-label={translate('palette.actions')}
            >
              <div class="truncate px-3 py-1.5 text-xs text-secondary">
                {menuItem.title}
              </div>
              {#each menuItem.actions as action, index (index)}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                  id={actionId(index)}
                  role="menuitem"
                  tabindex="-1"
                  aria-disabled={Boolean(action.disabled)}
                  class={[
                    'flex min-h-8 cursor-pointer items-center justify-between gap-2 rounded px-3 py-1.5 text-sm',
                    index === actionSelected && 'bg-interactive-tertiary-hover',
                    action.destructive ? 'text-danger' : 'text-primary',
                    action.disabled && 'opacity-60',
                  ]}
                  onmousedown={keepInputFocus}
                  onmousemove={() => (actionSelected = index)}
                  onclick={() => runAction(menuItem, index)}
                >
                  <span class="min-w-0">
                    <span class="block truncate">{action.title}</span>
                    {#if action.disabled}
                      <span class="block truncate text-xs text-secondary"
                        >{action.disabled}</span
                      >
                    {/if}
                  </span>
                  {#if index === 0}
                    {@render kbd('↵')}
                  {:else if index === 1}
                    {@render kbd(`${MOD}↵`)}
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <div
            class="flex items-center justify-between gap-3 border-t border-secondary px-4 py-2 text-xs text-secondary"
          >
            {#if pendingConfirm}
              <span class="truncate text-danger">{pendingConfirm.message}</span>
              <span class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded px-1 hover:text-primary"
                  onmousedown={keepInputFocus}
                  onclick={confirmPending}
                >
                  {translate('palette.confirm')}
                  {@render kbd('↵')}
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded px-1 hover:text-primary"
                  onmousedown={keepInputFocus}
                  onclick={() => (pendingConfirm = null)}
                >
                  {translate('palette.cancel')}
                  {@render kbd('esc')}
                </button>
              </span>
            {:else if status}
              <span class={['truncate', statusClass[status.variant]]}>
                {status.message}
              </span>
              {#if status.link}
                <a
                  class="shrink-0 underline hover:text-primary"
                  href={status.link}
                  onclick={close}>{translate('palette.open')}</a
                >
              {/if}
            {:else}
              <span class="truncate">
                {running
                  ? translate('palette.working')
                  : (currentView?.title ?? label)}
              </span>
              <span class="flex shrink-0 items-center gap-2">
                {#if selectedItem?.actions[0] && !selectedItem.disabled}
                  {selectedItem.actions[0].title}
                  {@render kbd('↵')}
                {/if}
                {#if selectedItem && selectedItem.actions.length > 1 && !selectedItem.disabled}
                  {translate('palette.actions')}
                  {@render kbd(`${MOD}K`)}
                {/if}
                {#if frames.length > 0}
                  {translate('palette.back')}
                  {@render kbd('esc')}
                {/if}
              </span>
            {/if}
          </div>
        </div>
      </div>
    </div>
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {spoken}
    </div>
  </dialog>
{/if}
