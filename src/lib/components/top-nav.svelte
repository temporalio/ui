<script lang="ts">
  import { page } from '$app/stores';

  import {
    MenuContainer,
    MenuButton,
    Menu,
    MenuItem,
  } from '$lib/holocene/menu';
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import type { NamespaceListItem } from '$lib/types/global';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { translate } from '$lib/i18n/translate';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';

  export let logout: () => void;
  export let namespaceList: NamespaceListItem[] = [];

  $: namespace = $page.params.namespace;
  $: pathNameSplit = $page.url.pathname.split('/');
  $: showNamespaceSpecificNav =
    namespace &&
    (pathNameSplit.includes('workflows') ||
      pathNameSplit.includes('schedules') ||
      pathNameSplit.includes('task-queues'));

  let showProfilePic = true;

  function fixImage() {
    showProfilePic = false;
  }

  const handleNamespaceSelect = (event: CustomEvent<NamespaceListItem>) => {
    const namespaceListItem = event.detail;
    $lastUsedNamespace = namespaceListItem.namespace;
    namespaceListItem?.onClick(namespaceListItem.namespace);
  };
</script>

<nav
  class="sticky top-0 z-30 flex h-12 w-full items-center justify-end border-b-2 bg-gray-100 p-1 px-4 md:px-10"
  data-testid="top-nav"
  class:bg-red-50={$dataEncoder.hasError && showNamespaceSpecificNav}
  aria-label={translate('main')}
>
  <div class="flex items-center gap-2">
    <TimezoneSelect />
    {#if showNamespaceSpecificNav}
      <Combobox
        label={translate('namespaces', 'namespace-label', { namespace })}
        noResultsText={translate('no-results')}
        labelHidden
        value={namespace}
        id="namespace-switcher"
        leadingIcon="namespace-switcher"
        options={namespaceList}
        optionValueKey="namespace"
        on:change={handleNamespaceSelect}
        position="right"
      />
      <DataEncoderStatus />
    {/if}
    {#if $authUser.accessToken}
      <MenuContainer>
        <MenuButton variant="ghost" hasIndicator controls="user-menu">
          <img
            src={$authUser?.picture}
            alt={$authUser?.profile ?? translate('user-profile')}
            class="h-[24px] w-[24px] cursor-pointer rounded-md"
            on:error={fixImage}
            class:hidden={!showProfilePic}
          />
          <div
            class="aspect-square h-full w-[24px] rounded-md bg-blue-200 p-0.5"
            class:hidden={showProfilePic}
          >
            {#if $authUser?.name}
              <div class="text-center text-sm text-black">
                {$authUser?.name.trim().charAt(0)}
              </div>
            {/if}
          </div>
        </MenuButton>
        <Menu id="user-menu" position="right">
          <MenuItem disabled>{$authUser.email}</MenuItem>
          <MenuItem on:click={logout}>{translate('log-out')}</MenuItem>
        </Menu>
      </MenuContainer>
    {/if}
  </div>
</nav>
