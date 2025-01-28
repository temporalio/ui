<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  interface Props {
    isCloud?: boolean;
    bottom?: Snippet;
    children?: Snippet;
    'aria-label'?: string;
  }

  let { isCloud = false, bottom, children, ...rest }: Props = $props();

  const toggle = () => ($navOpen = !$navOpen);

  let version = $derived($page.data?.settings?.version ?? '');
</script>

<nav
  class={merge(
    'group grid h-screen min-h-[600px] w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)_minmax(3rem,4rem)_1fr_8rem] gap-2 border-r border-subtle px-4 py-5 transition-width data-[nav=open]:w-[180px] data-[nav=open]:grid-cols-[100%]',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary/70 focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70',
    isCloud
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-950 text-off-white focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
      : 'surface-black',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...rest}
>
  <a href="/" class="w-fit">
    <Logo height={24} width={24} class="m-1" />
  </a>
  <button
    title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-[8px] self-start justify-self-end opacity-0 transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=open]:rotate-180 {isCloud
      ? 'focus-visible:ring-primary/70 focus-visible:dark:ring-success'
      : 'focus-visible:ring-primary/70'}"
    onclick={toggle}
  >
    <Icon name="chevron-right" />
  </button>
  <div role="list">
    {@render children?.()}
  </div>
  <div class="self-end">
    {@render bottom?.()}
    <div
      class="self-center justify-self-center py-3 text-center text-[0.6rem] text-slate-300"
    >
      <span class="sr-only">{translate('common.version')}</span>
      {version}
    </div>
  </div>
</nav>
