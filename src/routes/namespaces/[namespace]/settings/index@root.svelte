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
        currentNamespace,
      },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { fromSecondsToDaysOrHours } from '$lib/utilities/format-date';

  let selectedNamespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  export let currentNamespace: DescribeNamespaceResponse;
</script>

<h2 class="text-2xl" data-cy="settings-title">
  Settings: {selectedNamespace}
</h2>
<div class="flex">
  <div class="namespace-info w-full p-4">
    <h1 class="text-lg font-medium my-4">Details</h1>
    <p data-cy="namespace-description">
      <span class="font-medium mr-2">Description:</span>
      {currentNamespace?.namespaceInfo?.description}
    </p>
    <p data-cy="namespace-owner">
      <span class="font-medium mr-2">Owner:</span>
      {currentNamespace?.namespaceInfo?.ownerEmail || 'Unknown'}
    </p>
    <p data-cy="namespace-global">
      <span class="font-medium mr-2">Global?</span>
      {currentNamespace?.isGlobalNamespace ? 'Yes' : 'No'}
    </p>
    <p data-cy="namespace-retention">
      <span class="font-medium mr-2">Retention Period:</span>
      {fromSecondsToDaysOrHours(
        currentNamespace?.config?.workflowExecutionRetentionTtl.toString(),
      )}
    </p>
    <p data-cy="namespace-history">
      <span class="font-medium mr-2">History Archival:</span>
      {currentNamespace?.config?.historyArchivalState}
    </p>
    <p data-cy="namespace-visibility">
      <span class="font-medium mr-2">Visibility Archival:</span>
      {currentNamespace?.config?.visibilityArchivalState}
    </p>
    <p data-cy="namespace-failover">
      <span class="font-medium mr-2">Failover Version:</span>
      {currentNamespace?.failoverVersion}
    </p>
    <p data-cy="namespace-clusters">
      <span class="font-medium mr-2">Clusters:</span>
      {currentNamespace?.replicationConfig?.state} ({currentNamespace
        ?.replicationConfig?.activeClusterName})
    </p>
  </div>
</div>
