<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  interface Props extends HTMLAttributes<HTMLElement> {
    isCloud: boolean;
    environmentName?: string;
    children?: Snippet;
    bottom?: Snippet;
  }
  let {
    isCloud = false,
    environmentName = '',
    children,
    bottom,
    ...rest
  }: Props = $props();

  const toggle = () => ($navOpen = !$navOpen);

  const version = $derived(page.data?.settings?.version ?? '');
  const showEnvironmentName = $derived(
    !isCloud && environmentName && environmentName.trim().length > 0,
  );
</script>

<nav
  class={merge(
    'group grid min-h-screen w-16 grid-cols-[2rem] grid-rows-[fit-content(1.5rem)] gap-2 border-r border-subtle px-4 py-5 transition-width data-[nav=open]:w-[180px] data-[nav=open]:grid-cols-[100%]',
    'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary/70 focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70',
    isCloud
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-950 text-off-white focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
      : environmentName || 'surface-black',
  )}
  data-nav={$navOpen ? 'open' : 'closed'}
  data-testid="navigation-header"
  {...rest}
>
  <div
    class="flex items-center justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
  >
    <a href="/" class="flex w-fit items-center gap-1 text-nowrap">
      <Logo height={24} width={24} class="m-1" />
      <div>
        <p class="text-base font-medium group-data-[nav=closed]:hidden">
          {isCloud ? 'Cloud' : 'Self-Hosted'}
        </p>
        {#if showEnvironmentName}
          <p class="font-mono text-xs group-data-[nav=closed]:hidden">
            {environmentName.toUpperCase()}
          </p>
        {/if}
      </div>
    </a>
    <button
      title={$navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
      class="mx-2 flex items-center justify-center opacity-0 transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 group-hover:opacity-100 group-focus:opacity-100 group-data-[nav=open]:rotate-180 group-data-[nav=closed]:p-2 {isCloud
        ? 'focus-visible:ring-success'
        : 'focus-visible:ring-primary/70'}"
      onclick={toggle}
    >
      <Icon name="chevron-right" />
    </button>
  </div>
  <div role="list">
    {@render children?.()}
  </div>
  <div class="self-end">
    {@render bottom?.()}
    <div
      class="self-center justify-self-center py-3 text-center text-[0.6rem] text-slate-300"
    >
      <span class="sr-only">{translate('common.version')}</span>
      {version}
    </div>
  </div>
</nav>

<style lang="postcss">
  .development {
    @apply surface-development;
  }

  .staging {
    @apply surface-staging;
  }

  .test {
    @apply surface-test;
  }

  .production {
    @apply surface-black;
  }
</style>
