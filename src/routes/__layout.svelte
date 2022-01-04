<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { loadUser } from '$lib/stores/user';
  import { loadCluster } from '$lib/stores/cluster';
  import type {
    DescribeNamespaceResponse,
    ListNamespacesResponse,
  } from '$types';

  import '../app.postcss';

  export async function load({ fetch }: LoadInput) {
    const { namespaces }: ListNamespacesResponse = await requestFromAPI(
      '/namespaces',
      { request: fetch },
    );

    await loadUser();
    await loadCluster();

    return {
      props: { namespaces },
      stuff: { namespaces },
    };
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';

  import Header from './_header.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import Banner from '$lib/components/banner.svelte';

  export let namespaces: DescribeNamespaceResponse[];

  setContext('namespaces', namespaces);
</script>

<svelte:head>
  <title>Temporal</title>

  <link rel="manifest" href="/site.webmanifest" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <meta property="og:title" content="Temporal" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://temporal.io" />
  <meta property="og:image" content="/banner.png" />
</svelte:head>

<main class="flex flex-col h-screen">
  <Notifications />
  <Banner />
  <Header />
  <section id="content" class="h-full mx-10 mb-10 mt-8">
    <div class="flex flex-col h-full gap-4">
      <slot />
    </div>
  </section>
</main>
