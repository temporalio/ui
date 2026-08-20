<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';
  import { portal } from '$lib/holocene/portal/portal-action';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  interface Props {
    open?: boolean;
    position?: 'bottom' | 'right';
    dark?: boolean;
    onClick: (e: MouseEvent) => void;
    id?: string;
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
</script>

{#if open}
  <!-- Order matters: use:portal must run before use:focusTrap. Actions set up
  top-to-bottom, and focusTrap inerts everything outside this node by walking up
  to <body> — so the node must already be portaled into its final location, or
  the wrong siblings get inerted. -->
  <aside
    {id}
    data-theme={dark ? 'dark' : undefined}
    class={merge(
      'fixed z-[55] h-auto overflow-y-auto border-io-border-tertiary bg-io-background-primary text-io-content-primary',
      position === 'bottom' && 'bottom-0 left-0 right-0 border-t',
      position === 'right' &&
        'right-0 top-0 h-full w-screen border-l sm:max-w-fit',
      className,
    )}
    in:fly={flyParamsIn}
    out:fly={flyParamsOut}
    role="region"
    tabindex="-1"
    use:portal
    use:focusTrap={true}
    use:clickoutside={onClick}
  >
    <div class="relative h-full" class:pt-10={closePadding}>
      <div class="absolute right-2 top-2">
        <IconButton
          data-testid="drawer-close-button"
          label={closeButtonLabel}
          class="text-io-content-primary"
          icon="close"
          aria-expanded={open}
          aria-controls="navigation-drawer"
          onclick={onClick}
        />
      </div>
      {@render children?.()}
    </div>
  </aside>
{/if}
