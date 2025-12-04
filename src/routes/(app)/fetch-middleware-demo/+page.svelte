<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { composeFetchMiddleware } from '$lib/utilities/fetch-middleware';
  import { RequestResponseLogger } from '$lib/utilities/fetch-middleware/demo-interceptors';
  import { routeForApi } from '$lib/utilities/route-for-api';

  let fetchPromise = $state(null);

  function makeRequest() {
    console.log('🚀 Making request with middleware...');

    const enhancedFetch = composeFetchMiddleware([RequestResponseLogger]);
    const url = routeForApi('nexus-endpoints');
    console.log(url);
    fetchPromise = enhancedFetch(new Request(url)).then((res) =>
      res.json().catch((e) => console.error(e)),
    );
  }
</script>

<div class="mx-auto max-w-4xl p-6">
  <h1 class="mb-6 text-2xl font-bold">Fetch Middleware Demo</h1>

  <div class="mb-6">
    <button
      onclick={makeRequest}
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Test Nexus Endpoints (Check Console)
    </button>
  </div>

  {#await fetchPromise}
    <div class="text-gray-500">Loading...</div>
  {:then data}
    {#if data}
      <div>
        <h2 class="mb-2 text-lg font-semibold">Response Data:</h2>
        <CodeBlock
          content={JSON.stringify(data, null, 2)}
          language="json"
          copyable={true}
        />
      </div>
    {/if}
  {:catch error}
    {@debug error}
    <div class="text-red-500">
      <h2 class="mb-2 text-lg font-semibold">Error:</h2>
      <CodeBlock content={error.toString()} language="text" />
    </div>
  {/await}
</div>
