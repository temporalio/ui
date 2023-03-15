<script lang="ts">
  import { page } from '$app/stores';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import DropdownMenu from '$lib/holocene/dropdown-menu.svelte';
  import NamespaceList from './namespace-list.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { goto } from '$app/navigation';
  import {
    routeForSchedules,
    routeForWorkflows,
  } from '$lib/utilities/route-for';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import DataEncoderStatus from '$lib/holocene/data-encoder-status.svelte';
  import { authUser } from '$lib/stores/auth-user';

  export let logout: () => void;

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;

  $: namespace = $page.params.namespace;

  export let namespaceNames = isCloud
    ? [$page.params.namespace]
    : $namespaces.map((namespace: Namespace) => namespace?.namespaceInfo?.name);

  $: namespaceList = namespaceNames.map((namespace: string) => {
    const getHref = (namespace) =>
      isCloud ? routeForWorkflows({ namespace }) : getCurrentHref(namespace);
    return {
      namespace,
      href: (namespace: string) => getHref(namespace),
      onClick: (namespace: string) => {
        $lastUsedNamespace = namespace;
        $workflowFilters = [];
        $workflowSorts = [];
        goto(getHref(namespace));
      },
    };
  });

  function getCurrentHref(namespace: string) {
    const onSchedulesPage = $page.url.pathname.endsWith('schedules');
    const href = onSchedulesPage
      ? routeForSchedules({ namespace })
      : routeForWorkflows({ namespace });
    return href;
  }

  let showProfilePic = true;

  function fixImage() {
    showProfilePic = false;
  }
</script>

<div
  class="sticky top-0 z-30 flex h-10 w-full items-center justify-between border-b-2 bg-gray-100 p-1 px-10"
>
  <div class="flex items-center gap-2" />
  <div class="flex items-center gap-2">
    {#if namespace}
      <DropdownMenu
        id="namespace"
        position="right"
        class="border-3 bg-purple-200"
      >
        <div slot="trigger">
          <Badge type="purple" class="flex gap-1 pl-2"
            ><Icon name="namespace-switcher" class="scale-75" />{namespace}<Icon
              name="chevron-down"
            /></Badge
          >
        </div>
        <div class="w-full" slot="items" let:show>
          <NamespaceList {namespaceList} {show} />
        </div>
      </DropdownMenu>
    {/if}
    <DataEncoderStatus />
    {#if $authUser.accessToken}
      <DropdownMenu id="namespace" position="right">
        <div slot="trigger" class="flex items-center gap-1">
          {#if $authUser?.picture}
            <img
              src={$authUser?.picture}
              alt={$authUser?.profile ?? 'user profile'}
              class="mt-2 h-[24px] w-[24px] cursor-pointer rounded-md"
              on:error={fixImage}
              class:hidden={!showProfilePic}
            />
            <div
              class="aspect-square h-[24px] h-full w-[24px] rounded-full bg-blue-200 p-0.5"
              class:hidden={showProfilePic}
            >
              {#if $authUser?.name}
                <div class="text-center text-sm text-black">
                  {$authUser?.name.trim().charAt(0)}
                </div>
              {/if}
            </div>
            <Icon name="chevron-down" class="mt-1" />
          {/if}
        </div>
        <div class="h-auto w-[400px]" slot="items">
          <MenuItem class="cursor-normal rounded-t-xl"
            >{$authUser.email}</MenuItem
          >
          <MenuItem class="rounded-b-xl" on:click={logout}>Log out</MenuItem>
        </div>
      </DropdownMenu>
    {/if}
  </div>
</div>
