<script lang="ts">
  import { type Snippet, tick } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { portal } from '$lib/holocene/portal/portal-action';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import MaximizeButton from './button.svelte';

  interface Props {
    children: Snippet;
    maximized: boolean;
    class?: string;
    enabled?: boolean;
    actions?: Snippet;
  }

  let {
    children,
    maximized = $bindable(false),
    class: className = undefined,
    enabled = true,
    actions = undefined,
  }: Props = $props();

  let wrapperEl: HTMLElement | undefined = $state();
  let portalElement: ReturnType<typeof portal> | null = null;
  let originalParent: (Node & ParentNode) | null = null;
  let originalNextSibling: ChildNode | null = null;

  // Captured before toggling because maximizing re-renders the content
  // (e.g. CodeMirror), which blurs focus to <body> before the focus-trap action
  // activates — so the action can't observe the real trigger on its own.
  let previouslyFocused: HTMLElement | null = null;

  const maximize = () => {
    if (!wrapperEl) return;

    previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // Portal to <body> *before* setting `maximized`, so the node is already in
    // its final location when use:focusTrap activates later in the same flush.
    // focusTrap contains by inerting everything outside the node up to <body>;
    // if the node were still nested it would inert the wrong siblings. Doing
    // this in a $effect instead runs in the later user-effect phase — after the
    // action — which is exactly the ordering we need to avoid.
    originalParent = wrapperEl.parentNode;
    originalNextSibling = wrapperEl.nextSibling;
    portalElement = portal(wrapperEl, document.body);

    maximized = true;
  };

  const restorePosition = async () => {
    await tick();
    portalElement?.destroy();
    portalElement = null;
    if (wrapperEl && originalParent?.isConnected) {
      // The captured sibling may have been removed while maximized (e.g. a
      // re-render); insertBefore throws if the ref node is no longer a child.
      // Fall back to null (append to the end) in that case.
      const referenceNode =
        originalNextSibling?.parentNode === originalParent
          ? originalNextSibling
          : null;
      originalParent.insertBefore(wrapperEl, referenceNode);
    }
    originalParent = null;
    originalNextSibling = null;
  };

  const minimize = async () => {
    maximized = false;
    await restorePosition();
    if (previouslyFocused && document.body.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  };

  let escapeListener = (event: KeyboardEvent) => {
    if (maximized && event.key === 'Escape') {
      minimize();
    }
  };

  const handleClick = () => {
    if (maximized) {
      minimize();
    } else {
      maximize();
    }
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (
      maximized &&
      event.currentTarget instanceof Element &&
      event.relatedTarget instanceof Element &&
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      // Focus left intentionally — restore DOM position but don't steal it back.
      maximized = false;
      previouslyFocused = null;
      restorePosition();
    }
  };
</script>

<svelte:window onkeydown={escapeListener} />

<div
  bind:this={wrapperEl}
  class={merge(
    'relative',
    maximized &&
      'fixed left-0 right-0 top-0 z-100 h-full w-full overflow-y-auto bg-white dark:bg-black',
    className,
  )}
  tabindex="-1"
  onfocusout={handleFocusOut}
  use:focusTrap={maximized}
>
  {@render children()}

  <div
    class={merge(
      'absolute',
      maximized && 'fixed',
      'right-2 top-2 flex items-center',
    )}
  >
    {@render actions?.()}
    {#if enabled}
      <MaximizeButton
        class="m-0 rounded-full text-secondary"
        onclick={handleClick}
        {maximized}
      />
    {/if}
  </div>
</div>
