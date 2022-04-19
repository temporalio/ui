<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { DescribeNamespaceResponse } from '$types';

  export const load: Load = async function ({ params, url, stuff }) {
    const { searchParams } = url;

    if (searchParams.has('time-range')) searchParams.delete('time-range');

    const namespace = params.namespace;

    const namespaces: DescribeNamespaceResponse[] = stuff.namespaces;

    const currentNamespace = namespaces.find(
      (namespaceConfig) => namespaceConfig.namespaceInfo.name === namespace,
    );

    return {
      props: {
        namespaces,
        currentNamespace,
      },
    };
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Search from '$lib/components/search.svelte';

  let selectedNamespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  export let namespaces: DescribeNamespaceResponse[];
  export let currentNamespace: DescribeNamespaceResponse;

  console.log('Current Namespace: ', currentNamespace);
  let input = '';
</script>

<h2 class="text-2xl" data-test="archived-enabled-title">
  Settings: {selectedNamespace}
</h2>
<div class="w-1/2">
  <Search placeholder="Search" value={input} icon />
</div>
<div class="flex">
  <div class="recent-namespaces w-1/4 h-full p-4">
    <h1 class="text-lg font-medium my-2">Recent Namespaces</h1>
    {#each namespaces as namespace}
      <div>{namespace.namespaceInfo.name}</div>
    {/each}
  </div>
  <div class="namespace-info w-3/4 p-4 border-l-2">
    <h1 class="text-lg font-medium my-2">Details</h1>
    <p>Description: {currentNamespace.namespaceInfo.description}</p>
    <p>Owner: {currentNamespace.namespaceInfo.ownerEmail}</p>
    <p>Global? {currentNamespace.isGlobalNamespace ? 'Yes' : 'No'}</p>
    <p>
      Retention Period: {currentNamespace?.config
        ?.workflowExecutionRetentionTtl}
    </p>
    <p>History Archival: {currentNamespace?.config?.historyArchivalState}</p>
    <p>
      Visibility Archival: {currentNamespace?.config?.visibilityArchivalState}
    </p>
    <p>Clusters: {currentNamespace.replicationConfig.activeClusterName}</p>
  </div>
</div>
