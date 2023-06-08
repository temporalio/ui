<script lang="ts">
  import { page } from '$app/stores';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/holocene/dropdown-menu.svelte';
  import NamespaceList from '$lib/components/namespace-list.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import DataEncoderStatus from '$lib/holocene/data-encoder-status.svelte';
  import { authUser } from '$lib/stores/auth-user';
  import type { NamespaceListItem } from '$lib/types/global';
  import { dataEncoder } from '$lib/stores/data-encoder';

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
</script>

<div
  class="sticky top-0 z-30 flex h-10 w-full items-center justify-between border-b-2 bg-gray-100 p-1 px-4 md:px-10"
  data-testid="top-nav"
  class:bg-red-50={$dataEncoder.hasError && showNamespaceSpecificNav}
>
  <div class="flex items-center gap-2" />
  <div class="flex items-center gap-2">
    {#if showNamespaceSpecificNav}
      {#key namespace}
        <DropdownMenu
          id="namespace"
          position="right"
          menuClass="border-2 bg-purple-200"
          buttonClass="border border-purple-700 rounded-sm"
        >
          <div slot="trigger" data-testid="namespace-select-button">
            <Badge type="purple" class="leading-0 flex gap-1 truncate pl-2"
              ><Icon name="namespace-switcher" class="scale-75" /><span
                class="max-w-[160px] truncate md:max-w-none">{namespace}</span
              ><Icon name="chevron-down" /></Badge
            >
          </div>
          <div
            class="h-auto max-h-[400px] w-[220px] max-w-[220px] overflow-auto md:w-[360px] md:max-w-[360px] lg:w-[500px] lg:max-w-[500px]"
            slot="items"
            let:open
            data-testid="namespace-select-list"
          >
            <NamespaceList {namespaceList} {open} />
          </div>
        </DropdownMenu>
      {/key}
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
          <MenuItem class="rounded-b-xl" on:click={logout}>Log out</MenuItem>
        </div>
      </DropdownMenu>
    {/if}
  </div>
</div>
