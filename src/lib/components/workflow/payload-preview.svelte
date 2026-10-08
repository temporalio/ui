<script lang="ts">
  import { onDestroy, type Snippet, tick } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Portal from '$lib/holocene/portal/portal.svelte';
  import { getFocusableElements } from '$lib/utilities/focus-trap';

  let {
    title,
    preview,
    children,
  }: { title: string; preview: Snippet; children: Snippet } = $props();

  const id = $props.id();
  let anchor = $state<HTMLHeadingElement>();
  let panel = $state<HTMLElement>();
  let open = $state(false);
  let pinned = $state(false);
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function show() {
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
    if (contains(event.relatedTarget)) return;
    await tick();
    if (!contains(document.activeElement) && !anchor?.closest('[inert]')) {
      close();
    }
  }

  function handleOutsidePointer(event: PointerEvent) {
    if (!contains(event.target) && !anchor?.closest('[inert]')) close();
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !open || anchor?.closest('[inert]')) return;
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

  onDestroy(cancelClose);
</script>

<svelte:window
  onpointerdown={handleOutsidePointer}
  onkeydowncapture={handleEscape}
/>

<div class="flex min-w-0 items-center gap-3">
  <h5 bind:this={anchor} class="shrink-0">
    <Button
      variant="ghost"
      size="xs"
      class="h-auto min-h-8 cursor-help border-0 p-0 text-base font-medium underline decoration-dotted underline-offset-4 hover:bg-transparent hover:text-primary focus-visible:bg-transparent active:scale-100 active:bg-transparent max-sm:min-h-11"
      aria-label={title}
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
    >
      {title}
    </Button>
  </h5>
  <code
    class="min-w-0 flex-1 truncate rounded border border-secondary bg-surface-overlay-primary px-2 py-1.5 font-mono text-xs text-primary"
    >{@render preview()}</code
  >
</div>

{#if anchor}
  <Portal {anchor} {open} position="bottom-left" offset={{ y: 8 }}>
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
      {@render children()}
    </div>
  </Portal>
{/if}
