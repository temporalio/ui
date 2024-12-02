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

  $: matchingNamespaces = $namespaces.filter((namespace: Namespace) =>
    namespace.namespaceInfo.name
      .toLowerCase()
      .includes(searchValue.toLowerCase()),
  );

  $: items = matchingNamespaces.map((namespace: Namespace, index: number) => ({
    namespace: namespace.namespaceInfo.name,
    index,
  }));
</script>

<PageTitle
  title={translate('namespaces.namespace-select-header')}
  url={$page.url.href}
/>
<div class="w-full p-8 xl:w-1/2">
  <h1 class="my-4">
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
    class="h-96 w-full overflow-hidden border"
    aria-label={translate('common.namespaces')}
  >
    {#if items.length}
      <VirtualList {items} let:item itemHeight={50}>
        <button
          on:click={() => navigateToNamespace(item.namespace)}
          class="surface-primary flex w-full cursor-pointer gap-2 truncate border-b p-3 text-left outline-none hover:bg-interactive-secondary-hover focus-visible:bg-interactive-secondary-hover"
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
