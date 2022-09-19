<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import '../../app.css';

  import { fetchSettings } from '$lib/services/settings-service';
  import { getUser } from '$lib/stores/user';

  export const load: Load = async function ({ fetch }) {
    const settings: Settings = await fetchSettings(fetch);
    const user = getUser();

    return {
      props: { user },
      stuff: { settings },
    };
  };
</script>

<script lang="ts">
  import Header from './_import-header.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';
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

<div class="flex h-screen w-screen flex-row">
  <Notifications />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <Header />
  </div>
  <section id="content" class="h-screen w-max flex-auto overflow-auto">
    <div class="z-10 flex h-full flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</div>
