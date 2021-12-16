<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';
  import { cluster } from '$lib/stores/cluster';

  const { supportedClients, ...clusterInformation } = $cluster;
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
