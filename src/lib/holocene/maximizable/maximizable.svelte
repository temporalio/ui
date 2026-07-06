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

  // Captured here (before toggling) because maximizing re-renders the content
  // (e.g. CodeMirror), which blurs focus to <body> before the focus-trap action
  // activates — so the action can't observe the real trigger on its own.
  let previouslyFocused: HTMLElement | null = null;

  const maximize = () => {
    previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    maximized = true;
  };

  const minimize = async () => {
    maximized = false;
    await tick();
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
      maximized = false;
    }
  };

  let wrapperEl: HTMLElement | undefined = $state();
  let portalElement: ReturnType<typeof portal> | null = null;

  $effect(() => {
    if (!wrapperEl || !maximized) return;

    const originalParent = wrapperEl.parentNode;
    const originalNextSibling = wrapperEl.nextSibling;
    portalElement = portal(wrapperEl, document.body);

    return () => {
      portalElement?.destroy();
      portalElement = null;
      if (originalParent?.isConnected) {
        originalParent.insertBefore(wrapperEl!, originalNextSibling);
      }
    };
  });
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
