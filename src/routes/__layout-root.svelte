<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { ListNamespacesResponse } from '$types';

  import '../app.css';

  import { fetchSettings } from '$lib/services/settings-service';

  import { fetchUser } from '$lib/services/user-service';
  import { fetchCluster } from '$lib/services/cluster-service';
  import { fetchNamespaces } from '$lib/services/namespaces-service';
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

    return {
      props: { user, cluster },
      stuff: {
        namespaces: namespacesResp?.namespaces,
        settings: { ...settings, defaultNamespace },
      },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import HeaderResponsive from './_header-responsive.svelte';
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
  <HeaderResponsive {user} />
  <section id="content" class="h-full mx-10 mb-10 mt-8">
    <div class="flex flex-col h-full gap-4 mt-12 xl:mt-0">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </section>
</main>
