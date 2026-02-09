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
  class="flex min-h-full flex-col justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
>
  <div role="list">
    <div
      class="align-center flex items-center justify-between px-2 pb-4 group-data-[nav=closed]:flex-col"
    >
      <a
        href={resolve('', {})}
        class="flex w-fit items-center gap-1 text-nowrap"
      >
        <Logo
          height={24}
          width={24}
          class={merge('m-1', subtitle !== 'Cloud' && 'hidden')}
        />
        {#if subtitle}
          <span
            class={merge(
              'font-medium text-indigo-100 group-data-[nav=closed]:hidden',
              subtitle !== 'Cloud' && 'pl-2 text-xs',
            )}
          >
            {subtitle}
          </span>
        {/if}
      </a>

      <button
        title={navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        class="mx-2 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=closed]:p-2"
        onclick={ontoggle}
      >
        <Icon name="collapse" height={20} width={20} />
      </button>
    </div>
    {#if children}
      {@render children()}
    {/if}
  </div>

  <div>
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
</div>
