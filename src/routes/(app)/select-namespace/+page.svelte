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
            message: translate('namespaces.unauthorized-namespace-error'),
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
  <div class="h-screen w-full" aria-label={translate('common.namespaces')}>
    {#if namespaceList.length}
      {#if filteredList.length}
        <VirtualList items={filteredList} let:item itemHeight={50}>
          {@const first = item === filteredList[0]}
          {@const last = item === filteredList[filteredList.length - 1]}
          <div class="link-item" class:first class:last>
            <button
              class="w-full truncate p-3 text-left"
              on:click={() => item?.onClick(item.namespace)}
            >
              {item.namespace}
            </button>
          </div>
        </VirtualList>
      {:else}
        <EmptyState title={translate('common.no-results')} />
      {/if}
    {:else}
      <EmptyState
        title={translate('namespaces.select-namespace-empty-state')}
      />
    {/if}
  </div>
</div>

<style lang="postcss">
  .link-item {
    @apply surface-primary flex border-collapse cursor-pointer gap-2 border border-x border-slate-900 from-blue-100 to-purple-100 hover:bg-gradient-to-br;
  }

  .link-item.first {
    @apply rounded-t border-t;
  }

  .link-item.last {
    @apply rounded-b border-b;
  }
</style>
