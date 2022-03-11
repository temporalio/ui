<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';
  import { notifications } from '$lib/stores/notifications';
  import { fetchSettings } from '$lib/services/settings-service';

  import { loadUser } from '$lib/stores/user';
  import { loadCluster } from '$lib/stores/cluster';

  import type {
    DescribeNamespaceResponse,
    ListNamespacesResponse,
  } from '$types';

  import '../app.postcss';

  const emptyNamespace = {
    namespaces: [],
  };

  async function loadNamespaces(): Promise<ListNamespacesResponse> {
    if (isCloud) {
      return Promise.resolve(emptyNamespace);
    }

    const results = await requestFromAPI<ListNamespacesResponse>(
      routeForApi('namespaces'),
      {
        request: fetch,
        onError: () => notifications.add('error', 'Unable to fetch namespaces'),
      },
    );

    return results ?? Promise.resolve(emptyNamespace);
  }

  export const load: Load = async function ({}) {
    const settings: Settings = await fetchSettings();
    const { namespaces }: ListNamespacesResponse = await loadNamespaces();

    loadUser();
    loadCluster().catch(() =>
      notifications.add('error', 'Unable to fetch cluster info'),
    );

    return {
      props: { namespaces },
      stuff: { namespaces, settings },
    };
  };
</script>

<script lang="ts">
  import { setContext } from 'svelte';

  import Header from './_header.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import Banner from '$lib/components/banner.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import { isCloud } from '$lib/utilities/env';

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
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</main>
