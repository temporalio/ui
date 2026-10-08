<script lang="ts">
  import { onDestroy, type Snippet, tick } from 'svelte';

  import IconButton from '$lib/holocene/icon-button.svelte';
  import { portal } from '$lib/holocene/portal/portal-action';
  import Portal from '$lib/holocene/portal/portal.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowExpand, IconChevronDown, IconClose } from '$lib/io/icon';
  import { getFocusableElements } from '$lib/utilities/focus-trap';

  let {
    title,
    preview,
    children,
  }: { title: string; preview: Snippet; children: Snippet<[number?]> } =
    $props();

  const id = $props.id();
  let anchor = $state<HTMLSpanElement>();
  let expandAnchor = $state<HTMLSpanElement>();
  let panel = $state<HTMLElement>();
  let expandedPanel = $state<HTMLDialogElement>();
  let expanded = $state(false);
  let open = $state(false);
  let pinned = $state(false);
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function show() {
    if (expanded) return;
    cancelClose();
    open = true;
  }

  function contains(target: EventTarget | null) {
    return (
      target instanceof Node &&
      (anchor?.contains(target) || panel?.contains(target))
    );
  }

  function close() {
    cancelClose();
    open = false;
    pinned = false;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(() => {
      if (
        !pinned &&
        !contains(document.activeElement) &&
        !anchor?.closest('[inert]')
      )
        close();
    }, 150);
  }

  async function handleFocusOut(event: FocusEvent) {
    if (expanded || contains(event.relatedTarget)) return;
    await tick();
    if (!contains(document.activeElement) && !anchor?.closest('[inert]')) {
      close();
    }
  }

  function handleOutsidePointer(event: PointerEvent) {
    if (!contains(event.target) && !anchor?.closest('[inert]')) close();
  }

  function handleEscape(event: KeyboardEvent) {
    if (
      expanded ||
      event.key !== 'Escape' ||
      !open ||
      anchor?.closest('[inert]')
    )
      return;
    if (panel?.contains(document.activeElement)) {
      anchor?.querySelector('button')?.focus();
    }
    close();
  }

  async function focusPanel(event: KeyboardEvent) {
    if (
      event.key === 'ArrowDown' ||
      (event.key === 'Tab' && !event.shiftKey && open)
    ) {
      event.preventDefault();
      show();
      await tick();
      if (panel) getFocusableElements(panel)[0]?.focus();
    }
  }

  function handlePanelKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !panel) return;
    const elements = getFocusableElements(panel);
    if (event.shiftKey && event.target === elements[0]) {
      event.preventDefault();
      anchor?.querySelector('button')?.focus();
    } else if (!event.shiftKey && event.target === elements.at(-1)) {
      event.preventDefault();
      const trigger = anchor?.querySelector('button');
      const pageElements = getFocusableElements(document.body).filter(
        (element) =>
          !panel?.contains(element) &&
          !element.closest('[inert]') &&
          element.getClientRects().length > 0,
      );
      const next = trigger
        ? pageElements[pageElements.indexOf(trigger) + 1]
        : undefined;
      close();
      next?.focus();
    }
  }

  async function expand() {
    expanded = true;
    close();
    await tick();
    expandedPanel?.showModal();
  }

  async function collapse() {
    close();
    expandAnchor?.querySelector('button')?.focus();
    await tick();
    expanded = false;
  }

  onDestroy(cancelClose);
</script>

<svelte:window
  onpointerdown={handleOutsidePointer}
  onkeydowncapture={handleEscape}
/>

<div class="flex min-w-0 items-center gap-3">
  <h5 class="shrink-0 text-base font-medium">{title}</h5>
  <div
    class="flex min-w-0 flex-1 items-center rounded border border-secondary bg-surface-overlay-primary"
  >
    <code
      class="min-w-0 flex-1 truncate px-2 py-1.5 font-mono text-xs text-primary"
      >{@render preview()}</code
    >
    <span bind:this={anchor} class="flex shrink-0">
      <IconButton
        Icon={IconChevronDown}
        size="xs"
        class="h-8 w-8 text-secondary max-sm:h-11 max-sm:w-11"
        label={`${translate('common.preview')} ${title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onpointerenter={show}
        onpointerleave={scheduleClose}
        onfocus={show}
        onblur={handleFocusOut}
        onkeydown={focusPanel}
        onclick={() => {
          if (pinned) close();
          else {
            show();
            pinned = true;
          }
        }}
      />
    </span>
    <span bind:this={expandAnchor} class="flex shrink-0">
      <IconButton
        Icon={IconArrowExpand}
        size="xs"
        class="h-8 w-8 text-secondary max-sm:h-11 max-sm:w-11"
        label={`${translate('common.maximize')} ${title}`}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-controls={expanded ? `${id}-expanded` : undefined}
        onclick={expand}
      />
    </span>
  </div>
</div>

{#if anchor && !expanded}
  <Portal {anchor} {open} position="bottom-right" offset={{ y: 8 }}>
    <div
      bind:this={panel}
      {id}
      role="dialog"
      aria-label={title}
      tabindex="-1"
      class="max-h-[min(480px,calc(100vh-32px))] w-[min(560px,calc(100vw-32px))] overflow-auto rounded-lg border border-primary bg-surface-primary p-3 text-primary shadow-lg"
      onpointerenter={show}
      onpointerleave={scheduleClose}
      onpointerdown={() => (pinned = true)}
      onfocusout={handleFocusOut}
      onkeydowncapture={handlePanelKeydown}
    >
      {@render children(300)}
    </div>
  </Portal>
{/if}

<dialog
  bind:this={expandedPanel}
  use:portal
  id={`${id}-expanded`}
  aria-label={title}
  aria-modal="true"
  class="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-auto bg-surface-primary p-4 text-primary"
  onclose={collapse}
  onclick={(event) => {
    if (event.target === expandedPanel) expandedPanel.close();
  }}
>
  {#if expanded}
    <div class="mb-3 flex justify-end">
      <IconButton
        Icon={IconClose}
        label={translate('common.close')}
        onclick={() => expandedPanel?.close()}
      />
    </div>
    {@render children()}
  {/if}
</dialog>
