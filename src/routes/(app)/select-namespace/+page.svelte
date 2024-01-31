<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { namespaces } from '$lib/stores/namespaces';
  import { toaster } from '$lib/stores/toaster';
  import { routeForWorkflows } from '$lib/utilities/route-for';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  let searchValue = '';

  const navigateToNamespace = async (namespace: string) => {
    const { authorized } = await fetchWorkflowForAuthorization(namespace);
    if (authorized) {
      $lastUsedNamespace = namespace;
      goto(routeForWorkflows({ namespace }));
    } else {
      toaster.push({
        variant: 'error',
        message: translate('namespaces.unauthorized-namespace-error'),
      });
    }
  };

  $: filteredList = $namespaces
    .map((namespace: Namespace, index: number) => ({
      namespace: namespace?.namespaceInfo?.name,
      index,
    }))
    .filter(({ namespace }) => namespace.includes(searchValue));
</script>

<PageTitle
  title={translate('namespaces.namespace-select-header')}
  url={$page.url.href}
/>
<div class="w-full p-8 xl:w-1/2">
  <h1 class="my-4 text-3xl">
    {translate('namespaces.select-namespace-welcome')}
  </h1>
  <p class="mb-8">{translate('namespaces.select-namespace')}</p>
  <form class="mb-5" role="search">
    <Input
      id="search-namespaces"
      type="search"
      label={translate('common.search')}
      labelHidden
      placeholder={translate('common.search')}
      icon="search"
      bind:value={searchValue}
    />
  </form>
  <div
    class="group h-screen w-full"
    aria-label={translate('common.namespaces')}
  >
    {#if filteredList.length}
      <VirtualList items={filteredList} let:item itemHeight={50}>
        <button
          on:click={() => navigateToNamespace(item.namespace)}
          class="surface-primary flex w-full border-collapse cursor-pointer gap-2 truncate border-x border-t from-blue-100 to-purple-100 p-3 text-left hover:bg-gradient-to-br"
          class:rounded-t={item.index === 0}
          class:border-b={item.index === filteredList.length - 1}
          class:rounded-b={item.index === filteredList.length - 1}
        >
          {item.namespace}
        </button>
      </VirtualList>
    {:else}
      <EmptyState
        title={$namespaces.length
          ? translate('common.no-results')
          : translate('namespaces.select-namespace-empty-state')}
      />
    {/if}
  </div>
</div>
