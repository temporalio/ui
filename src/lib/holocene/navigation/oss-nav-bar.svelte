<script lang="ts">
  import type { Snippet } from 'svelte';

  import { base } from '$app/paths';

  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowsLeftRightToLine, IconCollapse } from '$lib/io/icon';

  interface Props {
    version: string;
    navOpen: boolean;
    subtitle?: string;
    subtitleHref?: string;
    children?: Snippet;
    bottom?: Snippet;
    ontoggle: () => void;
  }

  let {
    version,
    navOpen,
    subtitle,
    subtitleHref,
    children,
    bottom,
    ontoggle,
  }: Props = $props();
</script>

<div
  class="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[2rem_2rem] items-center gap-y-2 pb-4 group-data-[nav=closed]:grid-cols-1"
>
  <div
    class="flex w-fit items-center gap-1 text-nowrap group-data-[nav=closed]:justify-self-center"
  >
    <a href={base || '/'} class="flex items-center">
      <Logo height={24} width={24} class="m-1" />
    </a>
    {#if subtitleHref}
      <a href={subtitleHref} class="text-inherit no-underline">
        <p class="text-base font-medium group-data-[nav=closed]:hidden">
          {subtitle || 'Web UI'}
        </p>
      </a>
    {:else}
      <p class="text-base font-medium group-data-[nav=closed]:hidden">
        {subtitle || 'Web UI'}
      </p>
    {/if}
  </div>
  <button
    title={navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-2 flex items-center justify-center justify-self-end rounded text-primary opacity-0 transition-opacity hover:bg-overlay-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=closed]:justify-self-center group-data-[nav=closed]:p-2"
    onclick={ontoggle}
  >
    {#if navOpen}
      <IconCollapse />
    {:else}
      <IconArrowsLeftRightToLine />
    {/if}
  </button>
</div>
<div role="list">
  {#if children}
    {@render children()}
  {/if}
</div>
<div class="self-end">
  {#if bottom}
    {@render bottom()}
  {/if}
  <div
    class="self-center justify-self-center py-3 text-center text-[0.6rem] text-inverse-secondary"
  >
    <span class="sr-only">{translate('common.version')}</span>
    {version}
  </div>
</div>
