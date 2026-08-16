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
    'group grid h-full min-h-full w-12 grid-cols-[2rem] grid-rows-[auto_minmax(0,1fr)_auto] gap-2 overflow-hidden border-r border-subtle px-2 py-2 transition-[width] duration-normal data-[nav=open]:w-56 data-[nav=open]:grid-cols-[100%] motion-reduce:transition-none',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary',
    'surface-secondary text-primary',
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
