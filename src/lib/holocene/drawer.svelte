<script lang="ts">
  import { fly } from 'svelte/transition';
  import { clickOutside } from '$lib/holocene/outside-click';

  import Icon from '$lib/holocene/icon/icon.svelte';

  export let open = false;
  export let title: string;
  export let onClick: () => void;
</script>

{#if open}
  <div
    class="drawer"
    transition:fly={{ y: 200, duration: 500 }}
    use:clickOutside
    id="navigation-drawer"
    role="region"
    on:click-outside={onClick}
  >
    <div class="title">
      <div />
      <h1>{title}</h1>
      <button
        aria-expanded={open}
        aria-controls="navigation-drawer"
        class="mx-4 cursor-pointer"
        on:click={onClick}
      >
        <Icon name="close" />
      </button>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
{/if}

<style lang="postcss">
  .drawer {
    @apply fixed bottom-0 left-0 right-0 z-[55] h-auto rounded-t-lg bg-gray-900 text-gray-100 shadow-xl;
  }

  .title {
    @apply flex items-center justify-between py-4;
  }

  .title h1 {
    @apply text-2xl;
  }

  .content {
    @apply whitespace-normal p-8;
  }
</style>
