<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Icon from '$lib/anthropocene/icon/icon.svelte';
  import Logo from '$lib/anthropocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;

  const toggle = () => ($navOpen = !$navOpen);

  $: version = $page.data?.settings?.version ?? '';
</script>

<nav
  class={merge(
    'group grid min-h-screen w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)] gap-2 border-r border-subtle px-4 py-5 transition-width data-[nav=open]:w-[180px] data-[nav=open]:grid-cols-[100%]',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary/70 focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70',
    isCloud
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-950 text-off-white focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
      : 'surface-black',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...$$restProps}
>
  <div
    class="flex items-center justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
  >
    <a href="/" class="flex w-fit items-center gap-1 text-nowrap">
      <Logo height={24} width={24} class="m-1" />
      <p class="text-base font-medium group-data-[nav=closed]:hidden">
        {isCloud ? 'Cloud' : 'Self-Hosted'}
      </p>
    </a>
    <button
      title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
      class="mx-2 flex items-center justify-center opacity-0 transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=open]:rotate-180 group-data-[nav=closed]:p-2 {isCloud
        ? 'focus-visible:ring-success'
        : 'focus-visible:ring-primary/70'}"
      onclick={toggle}
    >
      <Icon name="chevron-right" />
    </button>
  </div>
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
