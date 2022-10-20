<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import NamespaceList from '$lib/components/namespace-list.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { routeForWorkflows } from '$lib/utilities/route-for';
  import EmptyState from '$lib/holocene/empty-state.svelte';

  const showTemporalSystemNamespace =
    $page.stuff?.settings?.showTemporalSystemNamespace;

  const namespaces = ($page.stuff.namespaces || [])
    .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
    .filter(
      (namespace: string) =>
        showTemporalSystemNamespace || namespace !== 'temporal-system',
    );

  const namespaceList = namespaces.map((namespace: string) => {
    return {
      namespace,
      href: (namespace: string) => routeForWorkflows({ namespace }),
      onClick: (namespace: string) => {
        $lastUsedNamespace = namespace;
        goto(routeForWorkflows({ namespace }));
      },
    };
  });
</script>

<div class="p-8">
  <h1 class="my-4 text-3xl">Welcome to Temporal</h1>
  <p class="mb-8">Select a namespace to get started.</p>
  <ul class="w-full xl:w-1/2">
    {#each namespaceList as namespace}
      <li
        class="flex border-collapse cursor-pointer gap-2 truncate border-b border-l border-r p-3 first:rounded-t-md first:border-t last:rounded-b-md hover:bg-gray-50"
        on:click={() => namespace?.onClick(namespace.namespace)}
      >
        <a href={namespace.href(namespace.namespace)} class="link"
          >{namespace.namespace}</a
        >
      </li>
    {:else}
      <EmptyState title="No Namespaces. Contact your admin to create one." />
    {/each}
  </ul>
</div>

<style lang="postcss">
  .link {
    @apply ml-2 truncate text-gray-900;
  }
  .link:hover {
    @apply underline;
  }
</style>
