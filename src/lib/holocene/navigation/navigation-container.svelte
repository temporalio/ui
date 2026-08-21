<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { navOpen } from '$lib/stores/nav-open';

  import CloudNavBar from './cloud-nav-bar.svelte';
  import OSSNavBar from './oss-nav-bar.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    isCloud?: boolean;
    subtitle?: string;
    subtitleHref?: string;
    children?: Snippet;
    bottom?: Snippet;
  }

  let {
    isCloud = false,
    subtitle,
    subtitleHref,
    children,
    bottom,
    ...restProps
  }: Props = $props();

  const toggle = () => ($navOpen = !$navOpen);

  let version = $derived(page.data?.settings?.version ?? '');
</script>

<nav
  class={merge(
    'group grid min-h-full grid-cols-[2rem] grid-rows-[fit-content(1.5rem)] gap-2 border-r border-io-border-primary px-2 py-4 transition-width data-[nav=closed]:w-[calc(3rem_+_1px)] data-[nav=open]:w-[16rem] data-[nav=open]:grid-cols-[100%] motion-reduce:transition-none',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-io-interactive-primary focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-io-interactive-primary',
    isCloud
      ? 'bg-gradient-to-b from-io-indigo-9 to-io-indigo-12 text-io-content-white focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-io-green-7 focus-visible:[&_a]:ring-io-green-7'
      : 'navigation-inverse bg-io-neutral-12 text-io-content-white',
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
      {subtitleHref}
      {children}
      {bottom}
      ontoggle={toggle}
    />
  {:else}
    <OSSNavBar
      {version}
      navOpen={$navOpen}
      {subtitle}
      {subtitleHref}
      {children}
      {bottom}
      ontoggle={toggle}
    />
  {/if}
</nav>
