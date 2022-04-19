<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { DescribeNamespaceResponse } from '$types';

  export const load: Load = async function ({ params, url, stuff }) {
    const { searchParams } = url;

    if (searchParams.has('time-range')) searchParams.delete('time-range');

    const namespace = params.namespace;

    const namespaces: DescribeNamespaceResponse[] = stuff.namespaces;

    const currentNamespaceConfig = namespaces.find(
      (namespaceConfig) => namespaceConfig.namespaceInfo.name === namespace,
    );

    return {
      props: {
        namespaces,
        currentNamespaceConfig,
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

  let input = '';
</script>

<h2 class="text-2xl" data-test="archived-enabled-title">
  Settings: {selectedNamespace}
</h2>
<Search placeholder="Search" value={input} icon />
<p>Recent Namespaces</p>
{#each namespaces as namespace}
  <div>{namespace.namespaceInfo.name}</div>
{/each}
