<script lang="ts">
  import { fly } from 'svelte/transition';
  import { clickOutside } from '$lib/holocene/outside-click';

  import IconButton from './icon-button.svelte';

  export let open = false;
  export let title: string;
  export let position: 'bottom' | 'right' = 'bottom';
  export let dark: boolean = true;
  export let onClick: () => void;

  const flyParams = {
    duration: 500,
    ...(position === 'bottom' ? { y: 200 } : { x: 200 }),
  };
</script>

{#if open}
  <div
    class="drawer {position}"
    class:dark
    transition:fly={flyParams}
    use:clickOutside
    id="navigation-drawer"
    role="region"
    on:click-outside={onClick}
  >
    <div class="close-button-wrapper">
      <IconButton
        icon="close"
        aria-expanded={open}
        aria-controls="navigation-drawer"
        on:click={onClick}
      />
    </div>
    <div class="title-wrapper {position}">
      <h1>{title}</h1>
      {#if $$slots['subtitle']}
        <h3 class="text-xs font-normal font-primary">
          <slot name="subtitle" />
        </h3>
      {/if}
    </div>

    <div class="content">
      <slot />
    </div>
  </div>
{/if}

<style lang="postcss">
  .drawer {
    @apply fixed z-[55] h-auto rounded-t-lg bg-white text-primary shadow-xl;

    &.bottom {
      @apply bottom-0 left-0 right-0;
    }

    &.right {
      @apply right-0 top-0 bottom-0 h-full px-2 py-32;
    }

    &.dark {
      @apply bg-gray-900 text-gray-100;
    }
  }

  .close-button-wrapper {
    @apply p-4 pb-0 flex w-full justify-end;
  }

  .title-wrapper {
    @apply p-4 pt-0 flex flex-col justify-center;

    &.bottom {
      @apply items-center;
    }

    &.right {
      @apply items-start;
    }
  }

  .title-wrapper h1 {
    @apply text-base font-medium font-primary mb-2;
  }

  .content {
    @apply whitespace-normal p-4;
  }
</style>
