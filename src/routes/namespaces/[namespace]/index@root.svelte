<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { DescribeNamespaceResponse } from '$types';

  export const load: Load = async function ({ params, url, stuff }) {
    const { searchParams } = url;

    if (searchParams.has('time-range')) searchParams.delete('time-range');

    const namespace = await fetchNamespace(params.namespace);
    const clusters = getClusters(namespace);

    return {
      props: {
        namespace,
        clusters,
      },
    };
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  import { page } from '$app/stores';

  import { temporalVersion, uiVersion } from '$lib/stores/versions';
  import { supportsReverseOrder } from '$lib/stores/event-view';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { searchAttributes } from '$lib/stores/search-attributes';

  import { fromSecondsToDaysOrHours } from '$lib/utilities/format-date';
  import { getClusters } from '$lib/utilities/get-clusters';

  import PageTitle from '$lib/components/page-title.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';

  import { fetchNamespace } from '$lib/services/namespaces-service';

  export let namespace: DescribeNamespaceResponse;
  export let clusters: string;

  onMount(() => {
    $lastUsedNamespace = namespace?.namespaceInfo?.name;
  });
</script>

<PageTitle
  title={`Namespaces | ${namespace?.namespaceInfo?.name}`}
  url={$page.url.href}
/>
<h2 class="text-2xl" data-cy="namespace-title">
  Namespace: {namespace?.namespaceInfo?.name}
</h2>
<div class="flex">
  <article class="namespace-info w-full p-4">
    <h1 class="my-4 text-lg font-medium">Details</h1>
    <p data-cy="namespace-description">
      <span class="mr-2 font-medium">Description:</span>
      {namespace?.namespaceInfo?.description}
    </p>
    <p data-cy="namespace-owner">
      <span class="mr-2 font-medium">Owner:</span>
      {namespace?.namespaceInfo?.ownerEmail || 'Unknown'}
    </p>
    <p data-cy="namespace-global">
      <span class="mr-2 font-medium">Global?</span>
      {namespace?.isGlobalNamespace ? 'Yes' : 'No'}
    </p>
    <p data-cy="namespace-retention">
      <span class="mr-2 font-medium">Retention Period:</span>
      {fromSecondsToDaysOrHours(
        namespace?.config?.workflowExecutionRetentionTtl.toString(),
      )}
    </p>
    <p data-cy="namespace-history">
      <span class="mr-2 font-medium">History Archival:</span>
      {namespace?.config?.historyArchivalState}
    </p>
    <p data-cy="namespace-visibility">
      <span class="mr-2 font-medium">Visibility Archival:</span>
      {namespace?.config?.visibilityArchivalState}
    </p>
    <p data-cy="namespace-failover">
      <span class="mr-2 font-medium">Failover Version:</span>
      {namespace?.failoverVersion}
    </p>
    <p data-cy="namespace-clusters">
      <span class="mr-2 font-medium">Clusters:</span>
      {clusters}
    </p>
  </article>

  <article class="namespace-info w-full p-4">
    <h1 class="my-4 text-lg font-medium">Versions</h1>
    <p data-cy="server-version">
      <span class="mr-2 font-medium">Temporal Server Version:</span>
      {$temporalVersion}
    </p>
    <p data-cy="ui-version">
      <span class="mr-2 font-medium">Temporal UI Version:</span>
      {$uiVersion}
    </p>
    {#if dev}
      <p data-cy="supports-reverse-order">
        <span class="mr-2 font-medium">Supports Descending Event History:</span>
        {$supportsReverseOrder}
      </p>
    {/if}
  </article>
</div>

{#if $searchAttributes}
  <section>
    <h1 class="my-4 text-lg font-medium">Search Attributes</h1>
    <Table class="w-full">
      <TableHeaderRow slot="headers">
        <th>Key</th>
        <th>Type</th>
      </TableHeaderRow>
      {#each Object.entries($searchAttributes) as [key, type]}
        <TableRow>
          <td>{key}</td>
          <td>{type}</td>
        </TableRow>
      {/each}
    </Table>
  </section>
{/if}
