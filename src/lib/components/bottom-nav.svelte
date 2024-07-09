<script lang="ts">
  import { slide } from 'svelte/transition';

  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Logo from '$lib/holocene/logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';
  import { dataEncoder } from '$lib/stores/data-encoder';
  // import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { NamespaceListItem } from '$lib/types/global';

  import BottomNavLinks from './bottom-nav-links.svelte';
  import BottomNavNamespaces from './bottom-nav-namespaces.svelte';
  import BottomNavSettings from './bottom-nav-settings.svelte';

  export let logout: () => void;
  export let namespaceList: NamespaceListItem[] = [];
  export let userEmaiLink = '';
  export let linkList: Partial<Record<string, string>>;
  export let isCloud = false;

  let viewLinks = false;
  let viewNamespaces = false;
  let viewSettings = false;

  $: namespace = $page.params.namespace;
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

  console.log(namespaceExists);

  let showProfilePic = true;

  function fixImage() {
    showProfilePic = false;
  }

  // const handleNamespaceSelect = (
  //   event: CustomEvent<{ value: NamespaceListItem }>,
  // ) => {
  //   const namespaceListItem = event.detail.value;
  //   $lastUsedNamespace = namespaceListItem.namespace;
  //   namespaceListItem?.onClick(namespaceListItem.namespace);
  // };

  const onLinksClick = () => {
    viewSettings = false;
    viewNamespaces = false;
    viewLinks = !viewLinks;
  };

  const onNamespaceFocus = () => {
    viewLinks = false;
    viewNamespaces = true;
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
</script>

{#if menuIsOpen}
  <div
    class="group surface-primary fixed top-0 z-50 h-[calc(100%-56px)] w-full overflow-auto p-4 md:hidden"
    data-nav="open"
    in:slide
    out:slide
  >
    <BottomNavLinks open={viewLinks} {linkList} {isCloud}>
      <slot />
    </BottomNavLinks>
    <BottomNavNamespaces open={viewNamespaces} {namespaceList} />
    <BottomNavSettings open={viewSettings} {logout} {userEmaiLink} />
  </div>
{/if}
<nav
  class="surface-primary fixed bottom-0 z-40 flex h-[56px] w-full flex-row items-center justify-between gap-5 border-t border-subtle px-4 py-2 md:hidden"
  data-testid="top-nav"
  class:bg-red-50={$dataEncoder.hasError && showNamespaceSpecificNav}
  aria-label={translate('common.main')}
>
  <button class="flex w-fit items-center rounded-lg" on:click={onLinksClick}>
    <Logo height={24} width={24} class="m-1" />
  </button>
  <div class="flex items-center">
    {#if showNamespaceSpecificNav}
      <Input
        label={translate('namespaces.namespace-label', { namespace })}
        labelHidden
        bind:value={namespace}
        on:focus={onNamespaceFocus}
        id="namespace-switcher"
        icon="namespace-switcher"
      />
    {/if}
  </div>
  <button class="flex items-center gap-2" on:click={onSettingsClick}>
    {#if $authUser.accessToken}
      <img
        src={$authUser.picture}
        alt={$authUser?.profile ?? translate('common.user-profile')}
        class="h-[32px] w-[32px] cursor-pointer rounded-md"
        on:error={fixImage}
        class:hidden={!showProfilePic}
      />
      <div
        class="flex aspect-square h-full w-[32px] items-center justify-center rounded-md bg-blue-200 p-0.5"
        class:hidden={showProfilePic}
      >
        {#if $authUser?.name}
          <div class="text-center text-sm text-black">
            {$authUser?.name.trim().charAt(0)}
          </div>
        {/if}
      </div>
    {:else}
      <div
        class="flex aspect-square h-full w-[32px] items-center justify-center rounded-md"
      >
        <Icon name="settings" height={24} width={24} />
      </div>
    {/if}
  </button>
</nav>
