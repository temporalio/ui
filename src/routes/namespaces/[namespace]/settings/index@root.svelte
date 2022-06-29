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

    const clusters = getClusters(currentNamespace);

    return {
      props: {
        currentNamespace,
        clusters,
      },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { dev } from '$app/env';
  import { temporalVersion, uiVersion } from '$lib/stores/versions';
  import { supportsReverseOrder } from '$lib/stores/event-view';
  import { fromSecondsToDaysOrHours } from '$lib/utilities/format-date';
  import { getClusters } from '$lib/utilities/get-clusters';

  let selectedNamespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  export let currentNamespace: DescribeNamespaceResponse;
  export let clusters: string;
</script>

<h2 class="text-2xl" data-cy="settings-title">
  Settings: {selectedNamespace}
</h2>
<section class="flex">
  <article class="namespace-info w-full p-4">
    <h1 class="my-4 text-lg font-medium">Details</h1>
    <p data-cy="namespace-description">
      <span class="mr-2 font-medium">Description:</span>
      {currentNamespace?.namespaceInfo?.description}
    </p>
    <p data-cy="namespace-owner">
      <span class="mr-2 font-medium">Owner:</span>
      {currentNamespace?.namespaceInfo?.ownerEmail || 'Unknown'}
    </p>
    <p data-cy="namespace-global">
      <span class="mr-2 font-medium">Global?</span>
      {currentNamespace?.isGlobalNamespace ? 'Yes' : 'No'}
    </p>
    <p data-cy="namespace-retention">
      <span class="mr-2 font-medium">Retention Period:</span>
      {fromSecondsToDaysOrHours(
        currentNamespace?.config?.workflowExecutionRetentionTtl.toString(),
      )}
    </p>
    <p data-cy="namespace-history">
      <span class="mr-2 font-medium">History Archival:</span>
      {currentNamespace?.config?.historyArchivalState}
    </p>
    <p data-cy="namespace-visibility">
      <span class="mr-2 font-medium">Visibility Archival:</span>
      {currentNamespace?.config?.visibilityArchivalState}
    </p>
    <p data-cy="namespace-failover">
      <span class="mr-2 font-medium">Failover Version:</span>
      {currentNamespace?.failoverVersion}
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
</section>
