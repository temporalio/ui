<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;
  export let linkList: Partial<Record<string, string>>;

  const toggle = () => ($navOpen = !$navOpen);

  $: version = $page.data?.settings?.version ?? '';
</script>

<nav
  class={merge(
    'group grid h-screen w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)_minmax(3rem,4rem)_1fr_1fr_8rem] gap-2 border-r border-subtle px-4 py-5 transition-width dark:surface-primary data-[nav=open]:w-40 data-[nav=open]:grid-cols-[100%]',
    isCloud ? 'surface-primary' : 'surface-inverse text-white',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...$$restProps}
>
  <a href={linkList.home}>
    <Logo height="24px" width="24px" class="m-1" />
  </a>
  <button
    title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-[4px] self-start justify-self-end opacity-0 transition-[opacity,transform] group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=open]:rotate-180"
    on:click={toggle}
  >
    <Icon name="chevron-right" />
  </button>
  <div role="list">
    <slot name="top" />
    <hr class="my-8 border-subtle" />
    <slot name="middle" />
  </div>

  <div
    class="self-center justify-self-center pb-3 text-[0.6rem] text-secondary"
  >
    <slot name="bottom" />
    <span class="sr-only">{translate('common.version')}</span>
    {version}
  </div>
</nav>
