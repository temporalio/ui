<script lang="ts">
  import { fly } from 'svelte/transition';

  import { setContext } from 'svelte';

  import { clickOutside } from '$lib/holocene/outside-click';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  export let open = false;
  export let position: 'bottom' | 'right' = 'bottom';
  export let dark = true;
  export let onClick: (e: MouseEvent | CustomEvent) => void;
  export let id = 'navigation-drawer';
  export let closeButtonLabel: string;
  export let closePadding: boolean = true;

  $: flyParams = {
    duration: 500,
    ...(position === 'bottom' ? { y: 200 } : { x: 200 }),
  };

  $: {
    setContext('drawer-pos', position);
  }
</script>

{#if open}
  <aside
    class="drawer {position} {$$props.class}"
    class:dark
    class:max-w-fit={position === 'right'}
    transition:fly={flyParams}
    use:clickOutside
    {id}
    role="region"
    on:click-outside={onClick}
    use:focusTrap={true}
  >
    <div class="relative h-full" class:pt-10={closePadding}>
      <div class="close-button-wrapper {position}" slot="close-button">
        <IconButton
          data-testid="drawer-close-button"
          label={closeButtonLabel}
          class="stuff"
          icon="close"
          aria-expanded={open}
          aria-controls="navigation-drawer"
          on:click={onClick}
        />
      </div>
      <slot />
    </div>
  </aside>
{/if}

<style lang="postcss">
  .drawer {
    @apply surface-primary fixed z-[55] h-auto overflow-y-auto rounded-t-lg text-primary shadow-xl;

    &.bottom {
      @apply bottom-0 left-0 right-0;
    }

    &.right {
      @apply bottom-0 right-0 top-0 h-full rounded-bl-lg rounded-tr-none;
    }

    &.dark {
      @apply bg-inverse text-slate-100;
    }
  }

  .close-button-wrapper {
    @apply absolute right-2 top-2;
  }
</style>
