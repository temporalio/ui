<script lang="ts">
  import { fly } from 'svelte/transition';

  import { setContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  interface Props {
    open?: boolean;
    position?: 'bottom' | 'right';
    dark?: boolean;
    onClick: (e: MouseEvent | CustomEvent) => void;
    id?: string;
    closeButtonLabel: string;
    closePadding?: boolean;
    class?: string;
    close_button?: Snippet;
    children?: Snippet;
  }

  let {
    open = false,
    position = 'bottom',
    dark = true,
    onClick,
    id = 'navigation-drawer',
    closeButtonLabel,
    closePadding = true,
    class: className = '',
    close_button,
    children,
  }: Props = $props();

  let flyParams = $derived({
    duration: 500,
    ...(position === 'bottom' ? { y: 200 } : { x: 200 }),
  });

  setContext('drawer-pos', position);
</script>

{#if open}
  <aside
    {id}
    class={merge(
      'surface-primary fixed z-[55] h-auto overflow-y-auto border-subtle text-primary',
      position === 'bottom' && 'bottom-0 left-0 right-0 border-t',
      position === 'right' && 'bottom-0 right-0 top-0 h-full border-l',
      dark && 'bg-black text-off-white',
      className,
    )}
    class:max-w-fit={position === 'right'}
    transition:fly={flyParams}
    role="region"
    use:focusTrap={true}
    use:clickoutside={onClick}
  >
    <div class="relative h-full" class:pt-10={closePadding}>
      <div class="absolute right-2 top-2">
        {#if close_button}
          {@render close_button()}
        {:else}
          <IconButton
            data-testid="drawer-close-button"
            label={closeButtonLabel}
            class={merge(
              dark ? 'text-white' : 'text-primary',
              'hover:text-primary',
            )}
            icon="close"
            aria-expanded={open}
            aria-controls="navigation-drawer"
            onclick={onClick}
          />
        {/if}
      </div>
      {@render children?.()}
    </div>
  </aside>
{/if}
