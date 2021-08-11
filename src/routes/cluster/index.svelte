<script context="module" lang="ts">
  import type { GetClusterInfoResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch }: LoadInput) {
    const cluster: GetClusterInfoResponse = await fetch(
      'http://localhost:8080/api/v1/cluster',
    ).then((response) => response.json());

    return {
      props: { cluster },
    };
  }
</script>

<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let cluster: GetClusterInfoResponse;
  const { supportedClients, ...clusterInformation } = cluster;
</script>

<main>
  <h2 class="text-4xl my-6 font-bold mx-4">Supported Clients</h2>
  <KeyValueTable headings={['Client', 'Version']} data={supportedClients} />
  <h2 class="text-4xl my-6 font-bold mx-4">Cluster Information</h2>
  <KeyValueTable headings={['Key', 'Value']} data={clusterInformation} />
</main>
