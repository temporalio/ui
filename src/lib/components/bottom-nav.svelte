<script lang="ts">
  import { writable } from 'svelte/store';
  import { slide } from 'svelte/transition';

  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem, NavLinkListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import BottomNavLinks from './bottom-nav-links.svelte';
  import BottomNavNamespaces from './bottom-nav-namespaces.svelte';
  import BottomNavSettings from './bottom-nav-settings.svelte';

  export let namespaceList: NamespaceListItem[] | undefined = [];
  export let linkList: NavLinkListItem[];
  export let isCloud = false;
  export let showNamespacePicker = true;

  let viewLinks = false;
  let viewNamespaces = writable(false);
  let viewSettings = false;

  function escapeHandler(e: KeyboardEvent) {
    if (
      e.key === 'Escape' &&
      [viewLinks, viewNamespaces, viewSettings].some((isOpen) => isOpen)
    ) {
      closeMenu();
    }
  }

  beforeNavigate(() => {
    closeMenu();
  });

  $: namespace = $page.params.namespace || $lastUsedNamespace;
  $: namespaceExists = namespaceList.some(
    (namespaceListItem) => namespaceListItem.namespace === namespace,
  );

  const onLinksClick = () => {
    viewLinks = !viewLinks;
    $viewNamespaces = false;
    viewSettings = false;
  };

  const onNamespaceClick = () => {
    viewLinks = false;
    $viewNamespaces = !$viewNamespaces;
    viewSettings = false;
  };

  const onSettingsClick = () => {
    viewLinks = false;
    $viewNamespaces = false;
    viewSettings = !viewSettings;
  };

  function closeMenu() {
    viewLinks = false;
    $viewNamespaces = false;
    viewSettings = false;
  }

  $: menuIsOpen = viewLinks || $viewNamespaces || viewSettings;

  const truncateNamespace = (namespace: string) => {
    if (namespace.length > 16) {
      return `${namespace.slice(0, 8)}...${namespace.slice(-8)}`;
    }
    return namespace;
  };
</script>

<svelte:window on:keypress={escapeHandler} />

{#if menuIsOpen}
  <div
    class="group surface-primary fixed top-0 z-50 h-[calc(100%-64px)] w-full overflow-auto md:hidden"
    data-nav="open"
    in:slide={{ duration: 200, delay: 0 }}
    out:slide={{ duration: 200, delay: 0 }}
  >
    <BottomNavLinks open={viewLinks} {linkList} />
    <slot name="nsPicker" open={$viewNamespaces} {closeMenu}>
      <BottomNavNamespaces open={$viewNamespaces} {namespaceList} />
    </slot>
    <BottomNavSettings open={viewSettings}>
      <slot />
    </BottomNavSettings>
  </div>
{/if}
<nav
  class={merge(
    'fixed bottom-0 z-40 flex h-[64px] w-full flex-row items-center justify-between gap-5 px-4 py-2 transition-colors md:hidden',
    isCloud
      ? 'text-off-white [&_[role=button]]:focus-visible:ring-success [&_a]:focus-visible:ring-success bg-linear-to-b from-indigo-600 to-indigo-900'
      : 'surface-black border-subtle border-t',
  )}
  data-testid="top-nav"
  aria-label={translate('common.main')}
>
  <button
    class="nav-button relative"
    data-testid="nav-menu-button"
    class:active-shadow={viewLinks}
    type="button"
    on:click={onLinksClick}
  >
    {#if viewLinks}
      <Icon name="close" height={32} width={32} />
    {:else}
      <Logo height={32} width={32} />
    {/if}
  </button>
  {#if showNamespacePicker}
    <div class="namespace-wrapper">
      <Button
        variant="ghost"
        data-testid="namespace-switcher"
        leadingIcon="namespace-switcher"
        size="xs"
        class="grow text-white"
        on:click={onNamespaceClick}>{truncateNamespace(namespace)}</Button
      >
      <div class="border-subtle ml-1 h-full w-1 border-l"></div>
      <Button
        variant="ghost"
        size="xs"
        href={routeForNamespace({ namespace })}
        disabled={!namespaceExists}
        ><Icon class="text-white" name="external-link" /></Button
      >
    </div>
  {/if}
  <button
    class="nav-button"
    data-testid="nav-profile-button"
    class:active-shadow={viewSettings}
    type="button"
    on:click={onSettingsClick}
  >
    {#if viewSettings}
      <Icon name="close" height={32} width={32} />
    {:else}
      <div
        class="flex aspect-square w-[32px] min-w-[32px] items-center justify-center"
      >
        <Icon name="astronaut" height={24} width={24} />
      </div>
    {/if}
  </button>
</nav>

<style lang="postcss">
  @reference "tailwindcss";

  .namespace-wrapper {
    @apply surface-black border-subtle dark:focus-within:surface-primary focus-within:border-interactive focus-within:ring-primary/70 flex h-10 w-full grow flex-row items-center border px-0.5 text-sm focus-within:ring-2 focus-within:outline-hidden;
  }

  .nav-button {
    @apply relative p-1 text-center align-middle text-xs font-medium uppercase transition-all select-none;
  }
</style>
