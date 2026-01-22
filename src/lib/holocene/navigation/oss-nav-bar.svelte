<script lang="ts">
  import type { Snippet } from 'svelte';

  import { resolve } from '$app/paths';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    version: string;
    navOpen: boolean;
    subtitle?: Snippet;
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
  <a href={resolve('', {})} class="flex w-fit items-center gap-1 text-nowrap">
    <Logo height={24} width={24} class="m-1" />
    {#if subtitle}
      <p class="text-base font-medium group-data-[nav=closed]:hidden">
        {@render subtitle()}
      </p>
    {/if}
  </a>
  <button
    title={navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
    class="mx-2 flex items-center justify-center opacity-0 transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=open]:rotate-180 group-data-[nav=closed]:p-2"
    onclick={ontoggle}
  >
    <Icon name="chevron-right" />
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
