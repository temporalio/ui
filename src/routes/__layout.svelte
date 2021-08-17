<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type {
    DescribeNamespaceResponse,
    ListNamespacesResponse,
  } from '$types/temporal/api/workflowservice/v1/request_response';

  export async function load({ fetch, page }: LoadInput) {
    const { namespace } = page.params;

    const { namespaces }: ListNamespacesResponse = await fetch(
      'http://localhost:8080/api/v1/namespaces',
    ).then((response) => response.json());

    return {
      props: { namespaces, namespace },
      context: { namespaces },
    };
  }
</script>

<script lang="ts">
  import '../app.postcss';
  import Navigation from './_navigation.svelte';
  import Header from './_header.svelte';
  import { setContext } from 'svelte';

  export let namespaces: DescribeNamespaceResponse[];
  export let namespace: string;

  setContext('namespace', namespace);
  setContext('namespaces', namespaces);
</script>

<svelte:head>
  <title>Temporal</title>

  <link rel="manifest" href="/site.webmanifest" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />

  <meta property="og:title" content="Temporal" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://temporal.io" />
  <meta property="og:image" content="/banner.png" />
</svelte:head>

<main class="flex align-start h-screen">
  <Navigation />
  <div class="w-full overflow-y-scroll">
    <Header />
    <div class="w-full relative">
      <slot />
    </div>
  </div>
</main>
