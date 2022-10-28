<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { routeForWorkflows } from '$lib/utilities/route-for';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { notifications } from '$lib/stores/notifications';
  import { fetchNamespaces } from '$lib/services/namespaces-service';

  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import type { ListNamespacesResponse } from '$types';

  let searchField: HTMLInputElement = null;
  let searchValue = '';

  const showTemporalSystemNamespace =
    $page.stuff?.settings?.showTemporalSystemNamespace;

  const namespacesPromise: Promise<ListNamespacesResponse> = fetchNamespaces(
    $page.stuff.settings,
  );

  function getNamespaceList(namespaces: Namespace[]) {
    const filteredNamespaces = namespaces
      .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
      .filter(
        (namespace: string) =>
          showTemporalSystemNamespace || namespace !== 'temporal-system',
      );

    return filteredNamespaces.map((namespace: string) => {
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
  }
</script>

<PageTitle title="Select Namespace" url={$page.url.href} />
<div class="w-full p-8 xl:w-1/2">
  <h1 class="my-4 text-3xl">Welcome to Temporal</h1>
  <p class="mb-8">Select a namespace to get started.</p>
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
  {#await namespacesPromise}
    <Loading />
  {:then namespacesResult}
    {@const namespaceList = getNamespaceList(namespacesResult?.namespaces)}
    <ul class="h-screen w-full">
      {#if namespaceList.length}
        {@const filteredList = namespaceList.filter(({ namespace }) =>
          namespace.includes(searchValue),
        )}
        {#if filteredList.length}
          <VirtualList items={filteredList} let:item itemHeight={50}>
            <li
              class="link-item"
              on:click={() => item?.onClick(item.namespace)}
            >
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
  {/await}
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
