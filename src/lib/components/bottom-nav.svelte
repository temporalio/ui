<script lang="ts">
  import { writable } from 'svelte/store';
  import { slide } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem, NavLinkListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import BottomNavLinks from './bottom-nav-links.svelte';
  import BottomNavSettings from './bottom-nav-settings.svelte';

  type Props = {
    children: Snippet;
    namespacePicker: Snippet<[{ open: boolean; closeMenu: () => void }]>;
    avatar: Snippet;
    namespaceList?: NamespaceListItem[];
    isCloud: boolean;
    linkList: NavLinkListItem[];
    showNamespacePicker?: boolean;
    environmentName?: string;
  };

  let {
    children,
    namespacePicker,
    avatar,
    namespaceList = [],
    isCloud = false,
    linkList,
    showNamespacePicker = true,
    environmentName,
  }: Props = $props();

  let viewLinks = $state(false);
  let viewNamespaces = writable(false);
  let viewSettings = $state(false);

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

  const namespace = $derived(page.params.namespace || $lastUsedNamespace);
  const namespaceExists = $derived(
    namespaceList.some(
      (namespaceListItem) => namespaceListItem.namespace === namespace,
    ),
  );
  const menuIsOpen = $derived(viewLinks || $viewNamespaces || viewSettings);

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
    class={merge(
      'group fixed top-0 z-50 h-[calc(100%-64px)] w-full overflow-auto md:hidden',
      'focus-visible:[&_[role=button]]:outline-none focus-visible:[&_[role=button]]:ring-2 focus-visible:[&_[role=button]]:ring-primary/70 focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70',
      isCloud
        ? 'bg-gradient-to-b from-indigo-600 to-indigo-950 text-off-white focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
        : 'surface-black',
    )}
    data-nav="open"
    in:slide={{ duration: 200, delay: 0 }}
    out:slide={{ duration: 200, delay: 0 }}
  >
    <BottomNavLinks open={viewLinks} {linkList} />
    {@render namespacePicker({ open: $viewNamespaces, closeMenu })}
    <BottomNavSettings open={viewSettings}>
      {@render children?.()}
    </BottomNavSettings>
  </div>
{/if}
<nav
  class={merge(
    'fixed bottom-0 z-40 flex h-[64px] w-full flex-row items-center justify-between gap-5 px-4 py-2 transition-colors md:hidden',
    'focus-visible:[&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-primary/70 focus-visible:[&_button]:outline-none focus-visible:[&_button]:ring-2 focus-visible:[&_button]:ring-primary/70',
    isCloud
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-900 text-off-white focus-visible:[&_a]:ring-success focus-visible:[&_button]:ring-success'
      : environmentName || 'surface-black border-t border-subtle',
  )}
  data-testid="top-nav"
  aria-label={translate('common.main')}
>
  <button
    class="nav-button relative"
    data-testid="nav-menu-button"
    class:active-shadow={viewLinks}
    type="button"
    onclick={onLinksClick}
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
      <div class="ml-1 h-full w-1 border-l border-subtle"></div>
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
    onclick={onSettingsClick}
  >
    {#if viewSettings}
      <Icon name="close" height={32} width={32} />
    {:else}
      <div
        class="flex aspect-square w-[32px] min-w-[32px] items-center justify-center"
      >
        {@render avatar()}
      </div>
    {/if}
  </button>
</nav>

<style lang="postcss">
  .namespace-wrapper {
    @apply surface-black flex h-10 w-full grow flex-row items-center border border-subtle px-0.5 text-sm dark:focus-within:surface-primary focus-within:border-interactive focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70;
  }

  .nav-button {
    @apply relative select-none p-1 text-center align-middle text-xs font-medium uppercase transition-all;
  }

  .development {
    @apply surface-development border-t border-subtle;
  }

  .staging {
    @apply surface-staging border-t border-subtle;
  }

  .test {
    @apply surface-test border-t border-subtle;
  }
</style>
