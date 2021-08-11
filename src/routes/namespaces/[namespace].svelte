<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { DescribeNamespaceResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  export async function load({ fetch, page }: LoadInput) {
    const { namespace } = page.params;

    const settings: DescribeNamespaceResponse = await fetch(
      'http://localhost:8080/api/v1/namespaces/' + namespace,
    ).then((response) => response.json());

    return {
      props: { settings },
    };
  }
</script>

<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let settings: DescribeNamespaceResponse;
  const {
    namespaceInfo,
    config,
    replicationConfig,
    ...otherSettings
  } = settings;
</script>

<main class="flex flex-wrap">
  <section>
    <h2 class="text-4xl my-6 font-bold mx-4">Namespace Information</h2>
    <KeyValueTable headings={['Key', 'Value']} data={namespaceInfo} />
  </section>
  <section>
    <h2 class="text-4xl my-6 font-bold mx-4">Configuation</h2>
    <KeyValueTable headings={['Key', 'Value']} data={config} />
  </section>
  <section>
    <h2 class="text-4xl my-6 font-bold mx-4">Replication</h2>
    <KeyValueTable headings={['Key', 'Value']} data={replicationConfig} />
  </section>
  <section>
    <h2 class="text-4xl my-6 font-bold mx-4">Other Settings</h2>
    <KeyValueTable headings={['Key', 'Value']} data={otherSettings} />
  </section>
</main>

<style lang="postcss">
  section {
    @apply w-1/2 p-6;
  }
</style>
