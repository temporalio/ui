<script lang="ts">
  import { type Snippet } from 'svelte';
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

  let escapeListener = (event: KeyboardEvent) => {
    if (maximized && event.key === 'Escape') {
      maximized = false;
    }
  };

  const handleClick = () => {
    maximized = !maximized;
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
      'fixed top-0 right-0 bottom-0 left-0 z-100 h-full w-full overflow-y-auto bg-white dark:bg-black',
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
      'top-2 right-2 flex items-center',
    )}
  >
    {@render actions?.()}
    {#if enabled}
      <MaximizeButton
        class="text-secondary m-0 rounded-full"
        onclick={handleClick}
        {maximized}
      />
    {/if}
  </div>
</div>
