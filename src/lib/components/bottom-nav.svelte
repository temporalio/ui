<script lang="ts">
  import { slide } from 'svelte/transition';

  import { twMerge as merge } from 'tailwind-merge';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem, NavLinkListItem } from '$lib/types/global';
  import { routeForNamespace } from '$lib/utilities/route-for';

  import BottomNavLinks from './bottom-nav-links.svelte';
  import BottomNavNamespaces from './bottom-nav-namespaces.svelte';
  import BottomNavSettings from './bottom-nav-settings.svelte';

  export let logout: () => void;
  export let namespaceList: NamespaceListItem[] = [];
  export let userEmaiLink = '';
  export let linkList: NavLinkListItem[];
  export let isCloud = false;

  let viewLinks = false;
  let viewNamespaces = false;
  let viewSettings = false;

  $: namespace = $page.params.namespace || $lastUsedNamespace;
  $: pathNameSplit = $page.url.pathname.split('/');
  $: showNamespaceSpecificNav =
    namespace &&
    (pathNameSplit.includes('workflows') ||
      pathNameSplit.includes('schedules') ||
      pathNameSplit.includes('batch-operations') ||
      pathNameSplit.includes('task-queues') ||
      pathNameSplit.includes('import'));
  $: namespaceExists = namespaceList.some(
    (namespaceListItem) => namespaceListItem.namespace === namespace,
  );

  const onLinksClick = () => {
    viewSettings = false;
    viewNamespaces = false;
    viewLinks = !viewLinks;
  };

  const onNamespaceClick = () => {
    viewLinks = false;
    viewNamespaces = !viewNamespaces;
    viewSettings = false;
  };

  const onSettingsClick = () => {
    viewLinks = false;
    viewNamespaces = false;
    viewSettings = !viewSettings;
  };

  beforeNavigate(() => {
    viewLinks = false;
    viewSettings = false;
    viewNamespaces = false;
  });

  $: menuIsOpen = viewLinks || viewNamespaces || viewSettings;

  const truncateNamespace = (namespace: string) => {
    if (namespace.length > 16) {
      return `${namespace.slice(0, 8)}...${namespace.slice(-8)}`;
    }
    return namespace;
  };
</script>

{#if menuIsOpen}
  <div
    class="group surface-primary fixed top-0 z-50 h-[calc(100%-64px)] w-full overflow-auto md:hidden"
    data-nav="open"
    in:slide={{ duration: 200, delay: 0 }}
    out:slide={{ duration: 200, delay: 0 }}
  >
    <BottomNavLinks open={viewLinks} {linkList} />
    <BottomNavNamespaces open={viewNamespaces} {namespaceList} />
    <BottomNavSettings open={viewSettings} {logout} {userEmaiLink} />
  </div>
{/if}
<nav
  class={merge(
    'fixed bottom-0 z-40 flex h-[64px] w-full flex-row items-center justify-between gap-5 px-4 py-2 transition-colors md:hidden',
    isCloud
      ? 'bg-gradient-to-b from-indigo-600 to-indigo-900 text-off-white focus-visible:[&_[role=button]]:ring-success focus-visible:[&_a]:ring-success'
      : 'surface-black border-t border-subtle',
  )}
  data-testid="top-nav"
  class:bg-red-400={$dataEncoder.hasError && showNamespaceSpecificNav}
  aria-label={translate('common.main')}
>
  <button
    class="nav-button relative"
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
  <div class="namespace-wrapper">
    <Button
      variant="ghost"
      leadingIcon="namespace-switcher"
      size="xs"
      class="grow text-white"
      on:click={onNamespaceClick}>{truncateNamespace(namespace)}</Button
    >
    <div class="ml-1 h-full w-1 border-l-2 border-subtle" />
    <Button
      variant="ghost"
      size="xs"
      href={routeForNamespace({ namespace })}
      disabled={!namespaceExists}
      ><Icon class="text-white" name="external-link" /></Button
    >
  </div>
  <button
    class="nav-button"
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
  .namespace-wrapper {
    @apply surface-black flex h-10 w-full grow flex-row items-center items-center rounded-lg border-2 border-subtle px-0.5 text-sm dark:focus-within:surface-primary focus-within:border-interactive focus-within:outline-none focus-within:ring-4 focus-within:ring-primary/70;
  }

  .nav-button {
    @apply relative select-none rounded-lg p-1 text-center align-middle text-xs font-medium uppercase transition-all;
  }
</style>
