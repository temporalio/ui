<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import '../../app.css';

  import { fetchSettings } from '$lib/services/settings-service';
  import { fetchUser } from '$lib/services/user-service';
  import { fetchCluster } from '$lib/services/cluster-service';

  export const load: Load = async function ({ fetch }) {
    const settings: Settings = await fetchSettings(fetch);

    const user = await fetchUser(fetch);
    const cluster = await fetchCluster(settings, fetch);

    return {
      props: { user, cluster },
      stuff: { settings },
    };
  };
</script>

<script lang="ts">
  import Header from './_import-header.svelte';
  import HeaderResponsive from './_import-header-responsive.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';

  export let user: User;
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
  <Header {user} />
  <HeaderResponsive {user} />
  <section id="content" class="h-full mx-10 mb-10 mt-8">
    <div class="flex flex-col h-full gap-4 mt-12 xl:mt-0">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</main>
