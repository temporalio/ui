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

<div class="flex flex-row w-screen h-screen">
  <Notifications />
  <div class="sticky top-0 h-screen w-auto z-20">
    <Header {user} />
  </div>
  <section id="content" class="flex-auto h-screen w-max overflow-auto">
    <div class="flex flex-col h-full gap-4 px-10 pb-10 pt-8 z-10">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</div>
