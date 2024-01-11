<script lang="ts">
  import { fly } from 'svelte/transition';

  import { clickOutside } from '$lib/holocene/outside-click';
  import { focusTrap } from '$lib/utilities/focus-trap';

  import IconButton from './icon-button.svelte';

  export let open = false;
  export let title: string;
  export let position: 'bottom' | 'right' = 'bottom';
  export let opposite = true;
  export let onClick: () => void;
  export let id = 'navigation-drawer';
  export let closeButtonLabel: string;

  $: flyParams = {
    duration: 500,
    ...(position === 'bottom' ? { y: 200 } : { x: 200 }),
  };
</script>

{#if open}
  <aside
    class="drawer {position}"
    class:opposite
    class:max-w-[400px]={position === 'right'}
    transition:fly={flyParams}
    use:clickOutside
    {id}
    role="region"
    on:click-outside={onClick}
    use:focusTrap={true}
  >
    <div class="close-button-wrapper {position}">
      <IconButton
        data-testid="drawer-close-button"
        label={closeButtonLabel}
        icon="close"
        aria-expanded={open}
        aria-controls="navigation-drawer"
        on:click={onClick}
      />
    </div>
    <div class="title-wrapper {position}">
      <h1>{title}</h1>
      {#if $$slots['subtitle']}
        <h3 class="font-primary text-xs font-normal">
          <slot name="subtitle" />
        </h3>
      {/if}
    </div>

    <div class="content {position}">
      <slot />
    </div>
  </aside>
{/if}

<style lang="postcss">
  .drawer {
    @apply bg-solid fixed z-[55] h-auto overflow-y-auto rounded-t-lg text-primary shadow-xl;

    &.bottom {
      @apply bottom-0 left-0 right-0;
    }

    &.right {
      @apply right-0 top-0 bottom-0 h-full;
    }

    &.opposite {
      @apply bg-gray-900 text-gray-100;
    }
  }

  .close-button-wrapper {
    @apply flex w-full justify-end p-2;

    &.right {
      @apply pb-20;
    }
  }

  .title-wrapper {
    @apply flex flex-col justify-center gap-2 py-4 px-8;

    &.bottom {
      @apply items-center p-0;
    }

    &.right {
      @apply items-start;
    }
  }

  .title-wrapper h1 {
    @apply font-primary text-base font-medium;
  }

  .content {
    @apply whitespace-normal px-8;

    &.right {
      @apply py-4;
    }

    &.bottom {
      @apply py-8;
    }
  }
</style>
