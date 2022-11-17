<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { routeForWorkflows } from '$lib/utilities/route-for';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { namespaces } from '$lib/stores/namespaces';
  import { notifications } from '$lib/stores/notifications';

  let searchField: HTMLInputElement = null;

  $: namespaceNames = $namespaces.map(
    (namespace: Namespace) => namespace?.namespaceInfo?.name,
  );

  $: namespaceList = namespaceNames.map((namespace: string) => {
    return {
      namespace,
      onClick: async (namespace: string) => {
        const { authorized } = await fetchWorkflowForAuthorization(namespace);
        if (authorized) {
          $lastUsedNamespace = namespace;
          goto(routeForWorkflows({ namespace }));
        } else {
          notifications.add(
            'error',
            'You do not have access to this namespace.',
          );
        }
      },
    };
  });

  let searchValue = '';
  $: filteredList = namespaceList.filter(({ namespace }) =>
    namespace.includes(searchValue),
  );
</script>

<PageTitle title="Select Namespace" url={$page.url.href} />
<div class="w-full p-8 xl:w-1/2">
  <h1 class="my-4 text-3xl">Welcome to Temporal</h1>
  <p class="mb-8">Select a Namespace to get started.</p>
  <div class="mb-5 flex rounded-full border p-1 pr-4">
    <div class="ml-4 mr-2">
      <Icon name="search" />
    </div>
    <input
      class="w-full"
      placeholder="Search"
      bind:value={searchValue}
      bind:this={searchField}
    />
  </div>
  <ul class="h-screen w-full">
    {#if namespaceList.length}
      {#if filteredList.length}
        <VirtualList items={filteredList} let:item itemHeight={50}>
          <li class="link-item" on:click={() => item?.onClick(item.namespace)}>
            {item.namespace}
          </li>
        </VirtualList>
      {:else}
        <EmptyState title="No results." />
      {/if}
    {:else}
      <EmptyState title="No Namespaces. Contact your admin to create one." />
    {/if}
  </ul>
</div>

<style lang="postcss">
  .link-item {
    @apply flex border-collapse cursor-pointer gap-2 truncate border p-3 hover:bg-gray-50;
  }

  .link-item:hover .link {
    @apply text-blue-700 underline;
  }
  .link {
    @apply ml-2 truncate text-gray-900;
  }
</style>
