<script lang="ts">
  import { fly } from 'svelte/transition';

  import { onDestroy, onMount, setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  export let open = false;
  export let position: 'bottom' | 'right' = 'bottom';
  export let dark = true;
  export let onClick: (e: MouseEvent | CustomEvent) => void;
  export let id = 'navigation-drawer';
  export let closeButtonLabel: string;
  export let closePadding: boolean = true;

  let portalElement: HTMLElement | null = null;

  let className = '';
  export { className as class };

  $: flyParamsIn = {
    duration: 250,
    ...(position === 'bottom' ? { y: 200 } : { x: 100 }),
  };

  $: flyParamsOut = {
    duration: 150,
    ...(position === 'bottom' ? { y: 200 } : { x: 100 }),
  };

  $: {
    setContext('drawer-pos', position);
  }

  onMount(() => {
    portalElement = document.createElement('div');
    portalElement.className = 'drawer-portal';
    document.body.appendChild(portalElement);
  });

  onDestroy(() => {
    if (portalElement) {
      document.body.removeChild(portalElement);
    }
  });

  function portal(node: HTMLElement) {
    if (portalElement) {
      portalElement.appendChild(node);
    }

    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      },
    };
  }
</script>

{#if open && portalElement}
  <aside
    {id}
    class={merge(
      'surface-primary border-subtle text-primary fixed z-[55] h-auto overflow-y-auto',
      position === 'bottom' && 'right-0 bottom-0 left-0 border-t',
      position === 'right' &&
        'top-0 right-0 h-full w-screen border-l sm:max-w-fit',
      dark && 'text-off-white bg-black',
      className,
    )}
    in:fly={flyParamsIn}
    out:fly={flyParamsOut}
    role="region"
    use:portal
    use:focusTrap={true}
    use:clickoutside={onClick}
  >
    <div class="relative h-full" class:pt-10={closePadding}>
      <div class="absolute top-2 right-2">
        <slot name="close-button">
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
            on:click={onClick}
          />
        </slot>
      </div>
      <slot />
    </div>
  </aside>
{/if}
