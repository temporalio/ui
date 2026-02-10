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
    children?: Snippet;
    bottom?: Snippet;
    ontoggle: () => void;
  }

  let { version, navOpen, subtitle, children, bottom, ontoggle }: Props =
    $props();
</script>

<div
  class="flex items-center justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
>
  <a
    href={resolve('', {})}
    class="text-inherit flex items-center gap-2 no-underline"
  >
    <Logo
      height={24}
      width={24}
      class={merge('m-1', subtitle !== 'Cloud' && 'hidden')}
    />
    {#if subtitle === 'Cloud'}
      <h2
        class={merge(
          'font-secondary mb-0 hidden whitespace-nowrap text-2xl font-medium text-white group-data-[nav=open]:block',
        )}
      >
        {subtitle}
      </h2>
    {:else}
      <h2
        class={merge(
          'font-secondary mb-0 hidden whitespace-nowrap px-2 text-sm text-white group-data-[nav=open]:block',
        )}
      >
        {subtitle}
      </h2>
    {/if}
  </a>
  <button
    title={navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-[8px] justify-self-end transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
    onclick={ontoggle}
  >
    <Icon name="collapse" />
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
    x
  </div>
</div>
