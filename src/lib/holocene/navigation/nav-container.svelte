<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;
  export let linkList: Partial<Record<string, string>>;

  function toggleNav() {
    $navOpen = !$navOpen;
  }
</script>

<nav
  class="nav-header transition-width"
  class:cloud={isCloud}
  data-testid="navigation-header"
  aria-label="primary"
  {...$$restProps}
>
  <div class="h-10 md:h-32 md:min-h-[84px] md:relative">
    <a
      href={linkList.home}
      class="absolute top-[8px] left-[8px] md:top-[22px] md:left-[18px] block z-[51]"
    >
      <Logo
        height="24px"
        width="24px"
        {isCloud}
        title="View Recent Workflows"
      />
    </a>
    <button
      class="nav-toggle"
      class:open={$navOpen}
      class:close={!$navOpen}
      on:click={toggleNav}
      title={$navOpen ? 'Collapse menu' : 'Expand menu'}
    >
      <Icon name={$navOpen ? 'chevron-left' : 'chevron-right'} />
    </button>
  </div>
  <div
    class="nav-wrapper transition-width"
    class:open={$navOpen}
    class:close={!$navOpen}
  >
    <div class="nav-section-wrapper">
      <ul class="nav-section ml-8 md:ml-0">
        <slot name="top" />
      </ul>
      <div
        class="w-2 h-8 border-l-2 {isCloud
          ? 'border-gray-200'
          : 'border-gray-700'} md:hidden"
      />
      <hr
        class="hidden md:block md:w-full md:my-8 {isCloud
          ? 'stroke-gray-200'
          : 'stroke-gray-700'}"
      />
      <ul class="nav-section">
        <slot name="middle" />
      </ul>
    </div>
    <div class="nav-section-wrapper justify-end">
      <ul class="nav-section">
        <slot name="bottom" />
      </ul>
    </div>
  </div>
  <div
    class="text-[10px] hidden md:block md:w-full md:pb-12 md:pt-24 text-center {isCloud
      ? 'text-gray-500'
      : 'text-gray-300'}"
  >
    {$page.data?.settings?.version ?? ''}
  </div>
  <slot name="drawer" />
</nav>

<style lang="postcss">
  .nav-header {
    @apply relative z-0 flex flex-row md:flex-col justify-between h-10 md:h-screen bg-primary text-white;
  }

  .nav-header.cloud {
    @apply bg-white text-primary;
  }

  .nav-wrapper {
    @apply z-50 flex flex-row md:flex-col md:w-16 grow items-center justify-between;
  }

  .nav-wrapper.open {
    @apply w-40;
  }

  .nav-section-wrapper {
    @apply w-full flex flex-row md:flex-col;
  }

  .nav-section {
    @apply flex flex-row md:flex-col gap-2 px-3;
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
    @apply z-[51] top-[52px] left-[18px] hidden absolute transition-left;
  }

  .nav-header:hover .nav-toggle {
    @apply md:block;
  }

  .nav-header:focus .nav-toggle {
    @apply md:block;
  }

  .nav-toggle.close {
    left: 18px;
  }

  .nav-toggle.open {
    left: 130px;
  }

  .transition-left {
    transition: left 0.15s linear, width 0.15s linear;
  }

  .transition-width {
    transition: width 0.15s ease-in-out, width 0.15s ease-in-out;
  }
</style>
