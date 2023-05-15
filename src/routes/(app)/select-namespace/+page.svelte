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
  import { toaster } from '$lib/stores/toaster';

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
          toaster.push({
            variant: 'error',
            message: 'You do not have access to this namespace.',
          });
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
  <form class="search" role="search">
    <div class="ml-4 mr-2">
      <Icon name="search" />
    </div>
    <label class="sr-only" for="search-namespaces">Search Namespaces</label>
    <input
      class="w-full"
      placeholder="Search"
      type="search"
      id="search-namespaces"
      on:keydown|stopPropagation
      bind:value={searchValue}
    />
  </form>
  <ul class="h-screen w-full" aria-label="namespaces">
    {#if namespaceList.length}
      {#if filteredList.length}
        <VirtualList items={filteredList} let:item itemHeight={50}>
          {@const first = item === filteredList[0]}
          {@const last = item === filteredList[filteredList.length - 1]}
          <li class="link-item" class:first class:last>
            <button
              class="w-full p-3 text-left"
              on:click={() => item?.onClick(item.namespace)}
            >
              {item.namespace}
            </button>
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
  .search {
    @apply mb-5 flex rounded-full border-2 border-gray-900 bg-white p-1 pr-4;
  }

  .link-item {
    @apply flex border-collapse cursor-pointer gap-2 truncate border border-x-2 border-gray-900 bg-white from-blue-100 to-purple-100 hover:bg-gradient-to-br;
  }

  .link-item.first {
    @apply rounded-t-lg border-t-2;
  }

  .link-item.last {
    @apply rounded-b-lg border-b-2;
  }
</style>
