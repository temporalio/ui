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
  <div class="surface-inverse relative h-32 min-h-[84px]">
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
        class="my-8 w-full {isCloud ? 'stroke-slate-200' : 'stroke-slate-700'}"
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
  <div class="surface-inverse h-4 w-full pb-12 pt-24 text-center text-[10px]">
    {#if version}
      <span class="sr-only">{translate('common.version')}</span>
    {/if}
    {version}
  </div>
  <slot name="drawer" />
</nav>

<style lang="postcss">
  .nav-header {
    @apply relative flex h-screen flex-col justify-between bg-primary;
  }

  .nav-header.cloud {
    @apply surface-inverse;
  }

  .nav-wrapper {
    @apply surface-inverse flex w-16 grow flex-col items-center justify-between;
  }

  .nav-wrapper.open {
    @apply w-40;
  }

  .nav-section-wrapper {
    @apply surface-inverse flex w-full flex-col;
  }

  .nav-section {
    @apply surface-inverse flex flex-col gap-2 px-3;
  }

  .cloud {
    @apply surface-inverse;
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
    @apply absolute left-[18px] top-[52px] hidden transition-left;
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
