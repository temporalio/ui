<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { navOpen } from '$lib/stores/nav-open';

  import CloudNavBar from './cloud-nav-bar.svelte';
  import OSSNavBar from './oss-nav-bar.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    isCloud?: boolean;
    subtitle?: string;
    children?: Snippet;
    bottom?: Snippet;
  }

  let {
    isCloud = false,
    subtitle,
    children,
    bottom,
    ...restProps
  }: Props = $props();

  const toggle = () => ($navOpen = !$navOpen);

  let version = $derived(page.data?.settings?.version ?? '');
</script>

<nav
  class={merge(
    'group grid min-h-screen w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)] gap-2 border-r border-subtle px-2 py-5 transition-width data-[nav=open]:w-[180px] data-[nav=open]:grid-cols-[100%]',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary/70 focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70',
    isCloud
      ? 'w-16 bg-gradient-to-b from-indigo-600 to-indigo-950 text-off-white focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
      : 'surface-black',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...restProps}
>
  {#if isCloud}
    <CloudNavBar
      {version}
      navOpen={$navOpen}
      {subtitle}
      {children}
      {bottom}
      ontoggle={toggle}
    />
  {:else}
    <OSSNavBar
      {version}
      navOpen={$navOpen}
      {subtitle}
      {children}
      {bottom}
      ontoggle={toggle}
    />
  {/if}
</nav>
