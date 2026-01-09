<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    isCloud?: boolean;
    subtitle?: Snippet;
  }

  let {
    isCloud = false,
    subtitle,
    children,
    bottom,
    ...restProps
  }: {
    isCloud?: boolean;
    subtitle?: Snippet;
    children?: Snippet;
    bottom?: Snippet;
    [key: string]: boolean | Snippet;
  } = $props();

  const toggle = () => ($navOpen = !$navOpen);

  let version = $derived(page.data?.settings?.version ?? '');
</script>

<nav
  class={merge(
    'group grid min-h-screen w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)] gap-2 border-r border-subtle px-4 py-5 transition-width data-[nav=open]:w-[180px] data-[nav=open]:grid-cols-[100%]',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary/70 focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70',
    isCloud
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-950 text-off-white focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
      : 'surface-black',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...restProps}
>
  <div
    class="flex-col items-center justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
  >
    {#if isCloud}
      <div role="list">
        {#if subtitle}
          <div class=" flex items-center justify-between">
            <div
              class="text-xs font-medium text-indigo-100 group-data-[nav=closed]:hidden"
            >
              {@render subtitle()}
            </div>

            <button
              title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
              class="flex items-center justify-center"
              onclick={toggle}
            >
              <Icon name="push" class="h-6 w-6" />
            </button>
          </div>
        {/if}
        {#if children}
          {@render children()}
        {/if}
      </div>
    {:else}
      <a
        href={resolve('', {})}
        class="flex w-fit items-center gap-1 text-nowrap"
      >
        <Logo height={24} width={24} class="m-1" />
        <p class="text-base font-medium group-data-[nav=closed]:hidden">
          {'Self-Hosted'}
        </p>
      </a>
      <button
        title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        class="align-center flex flex-row items-center justify-between"
        onclick={toggle}
      >
        <Icon name="push" />
      </button>
    {/if}

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
  </div>
</nav>
