<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';
  import { portal } from '$lib/holocene/portal/portal-action';
  import { IconClose } from '$lib/io/icon';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  interface Props {
    open?: boolean;
    position?: 'bottom' | 'right';
    dark?: boolean;
    /** Closes the drawer: the close button, a click outside, or Escape. */
    onClick: (e: MouseEvent | KeyboardEvent) => void;
    id?: string;
    /** Id of the element that names the drawer, usually its heading. */
    labelledby?: string;
    /** Dim the page behind the drawer. */
    backdrop?: boolean;
    closeButtonLabel: string;
    closePadding?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    position = 'bottom',
    dark = true,
    onClick,
    id = 'navigation-drawer',
    labelledby,
    backdrop = false,
    closeButtonLabel,
    closePadding = true,
    class: className = '',
    children,
  }: Props = $props();

  const flyParamsIn = $derived({
    duration: 250,
    ...(position === 'bottom' ? { y: 200 } : { x: 100 }),
  });

  const flyParamsOut = $derived({
    duration: 150,
    ...(position === 'bottom' ? { y: 200 } : { x: 100 }),
  });

  // svelte-ignore state_referenced_locally
  setContext('drawer-pos', position);

  // Escape belongs to whatever inside the drawer is open first: a modal
  // dialog, or a menu whose trigger reports itself expanded.
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const target = event.target;
    if (
      target instanceof Element &&
      (target.closest('dialog[open]') ||
        target.closest('[aria-expanded="true"]'))
    ) {
      return;
    }
    onClick(event);
  };
</script>

{#if open && backdrop}
  <!-- Skipped by the focus trap's inert pass, so a click on it reaches the
  drawer's outside-click handler and closes the drawer. -->
  <div
    class="fixed inset-0 z-[54] bg-surface-overlay-neutral"
    aria-hidden="true"
    data-inert-skip
    transition:fade={{ duration: 200 }}
    use:portal
  ></div>
{/if}

{#if open}
  <!-- Order matters: use:portal must run before use:focusTrap. Actions set up
  top-to-bottom, and focusTrap inerts everything outside this node by walking up
  to <body> — so the node must already be portaled into its final location, or
  the wrong siblings get inerted. -->
  <aside
    {id}
    data-theme={dark ? 'dark' : undefined}
    class={merge(
      'fixed z-[55] h-auto overflow-y-auto border-tertiary bg-background-primary text-primary',
      position === 'bottom' && 'bottom-0 left-0 right-0 border-t',
      position === 'right' &&
        'right-0 top-0 h-full w-screen border-l sm:max-w-fit',
      className,
    )}
    in:fly={flyParamsIn}
    out:fly={flyParamsOut}
    role="dialog"
    aria-modal="true"
    aria-labelledby={labelledby}
    tabindex="-1"
    onkeydown={closeOnEscape}
    use:portal
    use:focusTrap={true}
    use:clickoutside={onClick}
  >
    <div class="relative h-full" class:pt-10={closePadding}>
      <div class="absolute right-2 top-2">
        <IconButton
          data-testid="drawer-close-button"
          label={closeButtonLabel}
          class="text-primary"
          Icon={IconClose}
          onclick={onClick}
        />
      </div>
      {@render children?.()}
    </div>
  </aside>
{/if}
