<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { resolve } from '$app/paths';

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
  class="flex items-center justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
>
  <div class="flex flex-row items-center justify-start">
    <a href={resolve('', {})} class="text-inherit flex items-center">
      <Logo
        height={24}
        width={24}
        class={merge(subtitle !== 'Cloud' && 'hidden')}
      />
    </a>
    {#if subtitle}
      {#if subtitleHref}
        <a href={subtitleHref} class="contents">
          <Icon
            label="Project Namespaces"
            name="arrow-left"
            class="m-1.5 text-indigo-100 group-data-[nav=closed]:hidden"
          />
          <h2
            class={merge(
              'mb-0 hidden whitespace-nowrap px-1 pr-2 font-sans font-medium not-italic text-indigo-100 underline group-data-[nav=open]:block',
              subtitle === 'Cloud' ? 'text-2xl' : 'text-xs underline-offset-2',
            )}
          >
            {subtitle}
          </h2>
        </a>
      {:else}
        <h2
          class={merge(
            'mb-0 hidden whitespace-nowrap pl-2 font-sans font-medium not-italic text-indigo-100 group-data-[nav=open]:block',
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
    class="mx-[8px] justify-self-end transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
    onclick={ontoggle}
  >
    <Icon name="collapse" class="text-indigo-100" />
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
    class="self-center justify-self-center py-3 text-center text-[0.6rem] text-slate-300"
  >
    <span class="sr-only">{translate('common.version')}</span>
    {version}
  </div>
</div>
