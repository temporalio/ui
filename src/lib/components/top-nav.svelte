<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/holocene/dropdown-menu.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import type { NamespaceListItem } from '$lib/types/global';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { translate } from '$lib/i18n/translate';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { goto } from '$app/navigation';

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
  let namespaceSwitcher: Combobox<NamespaceListItem>;

  function fixImage() {
    showProfilePic = false;
  }

  const handleNamespaceSelect = (event: CustomEvent<NamespaceListItem>) => {
    namespaceSwitcher.closeList();
    const ns = event.detail;
    $lastUsedNamespace = ns.namespace;
    goto(ns.href(ns.namespace));
  };
</script>

<div
  class="sticky top-0 z-30 flex h-[50px] w-full items-center justify-between border-b-2 bg-gray-100 p-1 px-4 md:px-10"
  data-testid="top-nav"
  class:bg-red-50={$dataEncoder.hasError && showNamespaceSpecificNav}
>
  <div class="flex items-center gap-2" />
  <div class="flex items-center gap-2">
    {#if showNamespaceSpecificNav}
      <Combobox
        bind:this={namespaceSwitcher}
        label={translate('namespaces', 'namespace-label', { namespace })}
        noResultsText={translate('no-results')}
        labelHidden
        value={namespace}
        id="namespace-switcher"
        options={namespaceList}
        optionValueKey="namespace"
      >
        <Icon name="namespace-switcher" slot="leading-icon" />
        <svelte:fragment let:option>
          <ComboboxOption
            selected={option.namespace === namespace}
            value={option}
            on:select={handleNamespaceSelect}
          >
            {option.namespace}
          </ComboboxOption>
        </svelte:fragment>
      </Combobox>
      <DataEncoderStatus />
    {/if}
    {#if $authUser.accessToken}
      <DropdownMenu id="user" position="right">
        <div slot="trigger" class="flex items-center gap-1">
          <img
            src={$authUser?.picture}
            alt={$authUser?.profile ?? 'user profile'}
            class="h-[24px] w-[24px] cursor-pointer rounded-md"
            on:error={fixImage}
            class:hidden={!showProfilePic}
          />
          <div
            class="aspect-square h-[24px] h-full w-[24px] rounded-md bg-blue-200 p-0.5"
            class:hidden={showProfilePic}
          >
            {#if $authUser?.name}
              <div class="text-center text-sm text-black">
                {$authUser?.name.trim().charAt(0)}
              </div>
            {/if}
          </div>
          <Icon name="chevron-down" class="mt-1" />
        </div>
        <div class="h-auto w-[300px]" slot="items">
          <MenuItem class="truncate rounded-t-xl" disabled
            >{$authUser.email}</MenuItem
          >
          <MenuItem class="rounded-b-xl" on:click={logout}
            >{translate('log-out')}</MenuItem
          >
        </div>
      </DropdownMenu>
    {/if}
  </div>
</div>
