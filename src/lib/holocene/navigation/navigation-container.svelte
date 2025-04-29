<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;

  const toggle = () => ($navOpen = !$navOpen);

  $: version = $page.data?.settings?.version ?? '';
</script>

<nav
  class={merge(
    'group border-subtle transition-width grid min-h-screen w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)_minmax(3rem,4rem)_1fr_8rem] gap-2 border-r px-4 py-5 data-[nav=open]:w-[180px] data-[nav=open]:grid-cols-[100%]',
    '[&_[role=button]]:focus-visible:ring-primary/70 [&_a]:focus-visible:ring-primary/70 [&_[role=button]]:focus-visible:ring-2 [&_[role=button]]:focus-visible:outline-hidden [&_a]:focus-visible:ring-2 [&_a]:focus-visible:outline-hidden',
    isCloud
      ? 'text-off-white [&_[role=button]]:focus-visible:ring-success [&_a]:focus-visible:ring-success bg-linear-to-b from-indigo-600 to-indigo-950'
      : 'surface-black',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...$$restProps}
>
  <a href="/" class="w-fit">
    <Logo height={24} width={24} class="m-1" />
  </a>
  <button
    title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-[8px] self-start justify-self-end opacity-0 transition-[opacity,transform] group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=open]:rotate-180 focus-visible:ring-2 focus-visible:outline-hidden {isCloud
      ? 'focus-visible:ring-primary/70 dark:focus-visible:ring-success'
      : 'focus-visible:ring-primary/70'}"
    on:click={toggle}
  >
    <Icon name="chevron-right" />
  </button>
  <div role="list">
    <slot />
  </div>
  <div class="self-end">
    <slot name="bottom" />
    <div
      class="self-center justify-self-center py-3 text-center text-[0.6rem] text-slate-300"
    >
      <span class="sr-only">{translate('common.version')}</span>
      {version}
    </div>
  </div>
</nav>
