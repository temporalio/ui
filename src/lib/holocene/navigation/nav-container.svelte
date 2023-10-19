<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;
  export let linkList: Partial<Record<string, string>>;

  function toggleNav() {
    $navOpen = !$navOpen;
  }

  $: version = $page.data?.settings?.version ?? '';
</script>

<nav
  class="nav-header transition-width"
  class:cloud={isCloud}
  data-testid="navigation-header"
  {...$$restProps}
>
  <div class="relative h-32 min-h-[84px]">
    <a
      href={linkList.home}
      class="absolute block"
      style="top: 22px; left: 18px;"
    >
      <Logo
        height="24px"
        width="24px"
        {isCloud}
        title={translate('workflows.recent-workflows-link')}
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
      <ul class="nav-section">
        <slot name="top" />
      </ul>
      <hr
        class="my-8 w-full {isCloud ? 'stroke-gray-200' : 'stroke-gray-700'}"
      />
      <ul class="nav-section">
        <slot name="middle" />
      </ul>
    </div>
    <div class="nav-section-wrapper">
      <ul class="nav-section">
        <slot name="bottom" />
      </ul>
    </div>
  </div>
  <div
    class="h-4 w-full pb-12 pt-24 text-center text-[10px] {isCloud
      ? 'text-gray-500'
      : 'text-gray-300'}"
  >
    {#if version}
      <span class="sr-only">{translate('common.version')}</span>
    {/if}
    {version}
  </div>
  <slot name="drawer" />
</nav>

<style lang="postcss">
  .nav-header {
    @apply relative flex h-screen flex-col justify-between bg-primary text-white;
  }

  .nav-header.cloud {
    @apply bg-white text-primary;
  }

  .nav-wrapper {
    @apply flex w-16 grow flex-col items-center justify-between;
  }

  .nav-wrapper.open {
    @apply w-40;
  }

  .nav-section-wrapper {
    @apply flex w-full flex-col;
  }

  .nav-section {
    @apply flex flex-col gap-2 px-3;
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
    @apply transition-left absolute top-[52px] left-[18px] hidden;
  }

  .nav-header:hover .nav-toggle {
    @apply block;
  }

  .nav-header:focus .nav-toggle {
    @apply block;
  }

  .nav-toggle.close {
    left: 18px;
  }

  .nav-toggle.open {
    left: 130px;
  }

  .transition-left {
    transition:
      left 0.15s linear,
      width 0.15s linear;
  }

  .transition-width {
    transition:
      width 0.15s ease-in-out,
      width 0.15s ease-in-out;
  }
</style>
