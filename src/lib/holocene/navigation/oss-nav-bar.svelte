<script lang="ts">
  import type { Snippet } from 'svelte';

  import { base } from '$app/paths';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';

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
  class="flex min-h-8 items-center justify-between pb-2 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-1"
>
  <div class="flex w-fit items-center gap-1 text-nowrap">
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
    class="navigation-toggle relative flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-secondary transition-colors hover:bg-interactive-secondary-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    onclick={ontoggle}
  >
    <Icon name="collapse" />
  </button>
</div>
<div role="list" class="min-h-0 overflow-y-auto overflow-x-hidden">
  {#if children}
    {@render children()}
  {/if}
</div>
<div class="min-w-0 self-end">
  {#if bottom}
    <div role="list">{@render bottom()}</div>
  {/if}
  <div
    class="self-center justify-self-center py-2 text-center text-[0.6875rem] text-subtle"
  >
    <span class="sr-only">{translate('common.version')}</span>
    {version}
  </div>
</div>

<style lang="postcss">
  @media (pointer: coarse) {
    .navigation-toggle::after {
      position: absolute;
      inset: -0.375rem;
      content: '';
    }
  }
</style>
