<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { base } from '$app/paths';

  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconArrowLeft,
    IconArrowSquareCaretLeft,
    IconArrowSquareCaretRight,
  } from '$lib/io/icon';

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
  class="flex min-h-7 items-center justify-between pb-2 group-data-[nav=closed]:justify-center"
>
  <div
    class="flex flex-row items-center justify-start group-data-[nav=closed]:hidden"
  >
    {#if subtitle === 'Cloud'}
      <a href={base || '/'} class="flex items-center text-inherit">
        <Logo height={24} width={24} />
      </a>
    {/if}
    {#if subtitle}
      {#if subtitleHref}
        <a
          href={subtitleHref}
          class="inline-flex items-center rounded hover:bg-surface-overlay-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
        >
          <IconArrowLeft
            title="Project Namespaces"
            class="m-1.5 text-primary group-data-[nav=closed]:hidden"
          />
          <h2
            class={merge(
              'mb-0 hidden whitespace-nowrap px-1 pr-2 font-sans font-medium not-italic text-primary underline hover:text-primary group-data-[nav=open]:block',
              subtitle === 'Cloud' ? 'text-2xl' : 'text-xs underline-offset-2',
            )}
          >
            {subtitle}
          </h2>
        </a>
      {:else}
        <h2
          class={merge(
            'mb-0 hidden whitespace-nowrap pl-2 font-sans font-medium not-italic text-primary group-data-[nav=open]:block',
            subtitle === 'Cloud' ? 'text-2xl' : 'text-xs',
          )}
        >
          {subtitle}
        </h2>
      {/if}
    {/if}
  </div>
  <button
    title={navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-[8px] flex size-6 items-center justify-center justify-self-end rounded text-secondary transition-[opacity,transform] hover:bg-surface-overlay-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
    onclick={ontoggle}
  >
    {#if navOpen}
      <IconArrowSquareCaretLeft />
    {:else}
      <IconArrowSquareCaretRight />
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
