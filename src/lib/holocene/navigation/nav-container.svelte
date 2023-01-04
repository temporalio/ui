<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;
  export let linkList: Partial<Record<string, string>>;

  function toggleNav() {
    $navOpen = !$navOpen;
  }
</script>

<nav class="nav-header transition-width " data-cy="navigation-header">
  <div
    class="nav-wrapper transition-width"
    class:cloud={isCloud}
    class:open={$navOpen}
    class:close={!$navOpen}
  >
    <div>
      <a
        href={linkList.home}
        class="absolute block"
        style="top: 22px; left: 18px;"
      >
        <Logo height="24px" width="24px" {isCloud} />
      </a>
    </div>
    <button
      class="nav-toggle transition-left"
      style="top: 52px;"
      on:click={toggleNav}
    >
      <Icon name={$navOpen ? 'chevron-left' : 'chevron-right'} />
    </button>
    <div class="mt-24 grow items-center">
      <ul class="flex flex-col gap-2">
        <slot name="top" />
      </ul>
    </div>
    <div class="relative grow-0 items-center">
      <ul class="flex flex-col gap-2 pb-32">
        <slot name="bottom" />
      </ul>
      <div
        class="absolute bottom-0 left-2 text-[10px] {isCloud
          ? 'text-gray-500'
          : 'text-gray-300'}"
      >
        {$page.data?.settings?.version ?? ''}
      </div>
    </div>
  </div>
  <slot name="drawer" />
</nav>

<style lang="postcss">
  .nav-header {
    @apply relative z-0 flex h-screen border-r-2 border-gray-200;
  }

  .nav-wrapper {
    @apply z-50 flex flex-col items-center justify-between bg-gray-900 px-3 pt-3 text-white;
  }

  .cloud {
    @apply bg-white text-gray-900;
  }

  .close :global(.nav-title) {
    width: 0;
  }

  .open :global(.nav-title) {
    width: 100px;
  }

  .open :global(.namespace) {
    width: 100px;
  }

  .nav-toggle {
    @apply invisible absolute;
  }

  .nav-header:hover .nav-toggle {
    @apply visible;
  }

  .nav-header:focus .nav-toggle {
    @apply visible;
  }

  .close .nav-toggle {
    left: 18px;
  }

  .open .nav-toggle {
    left: 132px;
  }

  .transition-left {
    transition: left 0.15s linear, width 0.15s linear;
  }

  .transition-width {
    transition: width 0.15s ease-in-out, width 0.15s ease-in-out;
  }
</style>
