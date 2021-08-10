<script context="module" lang="ts">
  import type { GetSearchAttributesResponse } from '$types/temporal/api/workflowservice/v1/request_response';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch }: LoadInput) {
    const searchAttributes: GetSearchAttributesResponse = await fetch(
      'http://localhost:8080/api/v1/search-attributes',
    ).then((response) => response.json());

    return {
      props: { searchAttributes },
    };
  }
</script>

<script lang="ts">
  import KeyValueTable from '$lib/components/key-value-table.svelte';

  export let searchAttributes: GetSearchAttributesResponse;
</script>

<main>
  <h2 class="text-4xl my-6 font-bold mx-4">Search Attributes</h2>
  <KeyValueTable
    headings={['Attribute', 'Type']}
    data={searchAttributes.keys}
  />
</main>
