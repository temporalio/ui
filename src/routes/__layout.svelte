<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import '../app.postcss';

  export const load: Load = async function ({ fetch }) {
    const { cluster, namespaces, settings, user } = await fetch(
      '/app.json',
    ).then((r) => r.json());

    return {
      props: { user, cluster },
      stuff: { namespaces, settings },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import Banner from '$lib/components/banner.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';

  export let user: User;
  export let cluster: ClusterInformation;
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
  <Banner {cluster} />
  <Header {user} />
  <section id="content" class="h-full mx-10 mb-10 mt-8">
    <div class="flex flex-col h-full gap-4">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</main>
