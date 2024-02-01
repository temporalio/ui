<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { navOpen } from '$lib/stores/nav-open';

  export let isCloud = false;
  export let linkList: Partial<Record<string, string>>;

  const toggle = () => ($navOpen = !$navOpen);

  $: version = $page.data?.settings?.version ?? '';
</script>

<nav
  class={merge(
    'group relative flex h-screen w-16 flex-col justify-between border-r border-primary transition-width dark:surface-primary dark:border-subtle',
    isCloud ? 'surface-primary' : 'surface-inverse text-white',
  )}
  class:w-40={$navOpen}
  data-testid="navigation-header"
  {...$$restProps}
>
  <div class="relative h-32 min-h-[84px]">
    <a href={linkList.home} class="absolute left-[18px] top-[22px] block">
      <Logo height="24px" width="24px" />
    </a>
    <button
      class="absolute left-[18px] top-[52px] hidden transition-left group-hover:block group-focus:block"
      title={$navOpen ? 'Collapse menu' : 'Expand menu'}
      on:click={toggle}
    >
      <Icon name={$navOpen ? 'chevron-left' : 'chevron-right'} />
    </button>
  </div>
  <div class="flex grow flex-col items-center justify-between">
    <div class="w-full space-y-8">
      <ul class="flex flex-col gap-2 px-3">
        <slot name="top" />
      </ul>
      <hr class="border-subtle" />
      <ul class="flex flex-col gap-2 px-3">
        <slot name="middle" />
      </ul>
    </div>
    <div class="w-full">
      <ul class="flex flex-col gap-2 px-3">
        <slot name="bottom" />
      </ul>
    </div>
  </div>
  <div class="h-4 w-full pb-12 pt-24 text-center text-[0.6rem] text-secondary">
    {#if version}
      <span class="sr-only">{translate('common.version')}</span>
    {/if}
    {version}
  </div>
  <slot name="drawer" />
</nav>
