<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';
  
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  import PageTitle from '$lib/components/page-title.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { namespaces } from '$lib/stores/namespaces';
  import { toaster } from '$lib/stores/toaster';
  import { routeForWorkflows } from '$lib/utilities/route-for';
  
  import type { DescribeNamespaceResponse as Namespace } from '$types';

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
            message: translate('namespaces', 'unauthorized-namespace-error'),
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

<PageTitle
  title={translate('namespaces', 'namespace-select-header')}
  url={$page.url.href}
/>
<div class="w-full p-8 xl:w-1/2">
  <h1 class="my-4 text-3xl">
    {translate('namespaces', 'select-namespace-welcome')}
  </h1>
  <p class="mb-8">{translate('namespaces', 'select-namespace')}</p>
  <form class="search" role="search">
    <div class="ml-4 mr-2">
      <Icon name="search" />
    </div>
    <label class="sr-only" for="search-namespaces"
      >{translate('namespaces', 'search-namespaces')}</label
    >
    <input
      class="w-full"
      placeholder={translate('search')}
      type="search"
      id="search-namespaces"
      on:keydown|stopPropagation
      bind:value={searchValue}
    />
  </form>
  <ul class="h-screen w-full" aria-label={translate('namespaces')}>
    {#if namespaceList.length}
      {#if filteredList.length}
        <VirtualList items={filteredList} let:item itemHeight={50}>
          {@const first = item === filteredList[0]}
          {@const last = item === filteredList[filteredList.length - 1]}
          <div class="link-item" class:first class:last>
            <button
              class="w-full p-3 text-left"
              on:click={() => item?.onClick(item.namespace)}
            >
              {item.namespace}
            </button>
          </div>
        </VirtualList>
      {:else}
        <EmptyState title={translate('no-results')} />
      {/if}
    {:else}
      <EmptyState
        title={translate('namespaces', 'select-namespace-empty-state')}
      />
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
