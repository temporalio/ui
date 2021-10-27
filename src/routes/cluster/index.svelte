<script context="module" lang="ts">
  import type { GetClusterInfoResponse } from '$types';

  import type { LoadInput } from '@sveltejs/kit';
  import { requestFromAPI } from '$lib/utilities/request-from-api';

  export async function load({ fetch }: LoadInput) {
    const cluster: GetClusterInfoResponse = await requestFromAPI('/cluster', {
      request: fetch,
    });

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

<main class="flex flex-wrap">
  <section class="p-6 w-1/2">
    <h2 class="text-4xl my-6 font-bold mx-4">Supported Clients</h2>
    <KeyValueTable headings={['Client', 'Version']} data={supportedClients} />
  </section>
  <section class="p-6 w-1/2">
    <h2 class="text-4xl my-6 font-bold mx-4">Cluster Information</h2>
    <KeyValueTable headings={['Key', 'Value']} data={clusterInformation} />
  </section>
</main>
