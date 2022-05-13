<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { ListNamespacesResponse } from '$types';

  import '../app.css';

  import { fetchSettings } from '$lib/services/settings-service';
  import { fetchUser } from '$lib/services/user-service';
  import { fetchCluster } from '$lib/services/cluster-service';
  import { fetchNamespaces } from '$lib/services/namespaces-service';
  import { fetchLatestUiVersion } from '$lib/services/github-service';
  import { getDefaultNamespace } from '$lib/utilities/get-namespace';
  import { isAuthorized } from '$lib/utilities/is-authorized';
  import type { GetClusterInfoResponse } from '$types';

  export const load: Load = async function ({ url, fetch }) {
    const settings: Settings = await fetchSettings({ url }, fetch);
    const user = await fetchUser(fetch);

    if (!isAuthorized(settings, user)) {
      return {
        status: 302,
        redirect: '/login',
      };
    }

    const namespacesResp: ListNamespacesResponse = await fetchNamespaces(
      settings,
      fetch,
    );
    const defaultNamespace: string = getDefaultNamespace({
      namespaces: namespacesResp?.namespaces,
      settings,
    });
    const cluster: GetClusterInfoResponse = await fetchCluster(settings, fetch);

    const uiVersionInfo: UiVersionInfo = {
      current: settings.version,
      recommended: settings.notifyOnNewVersion
        ? await fetchLatestUiVersion(fetch)
        : undefined,
    };

    return {
      props: { user, uiVersionInfo },
      stuff: {
        namespaces: namespacesResp?.namespaces,
        settings: { ...settings, defaultNamespace },
        cluster,
      },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import HeaderResponsive from './_header-responsive.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';

  export let user: User;
  export let uiVersionInfo: UiVersionInfo;
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
    <Banners {uiVersionInfo} />

    <div class="flex flex-col h-full gap-4 px-10 pb-10 pt-8 z-10">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</div>

<!-- flex-auto h-screen w-max overflow-auto mx-10 mb-10 mt-8 -->
<!-- <main class="flex flex-col h-screen">
  <Notifications />
  <Banners {uiVersionInfo} />
  <Header {user} />
  <HeaderResponsive {user} />
  <section id="content" class="h-full mx-10 mb-10 mt-8">
    <div class="flex flex-col h-full gap-4 mt-12 xl:mt-0">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</main> -->
