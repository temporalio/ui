<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { ListNamespacesResponse, GetClusterInfoResponse } from '$types';

  import '../app.css';

  import { fetchSettings } from '$lib/services/settings-service';
  import { getAuthUser, setAuthUser } from '$lib/stores/auth-user';
  import { fetchCluster } from '$lib/services/cluster-service';
  import { fetchNamespaces } from '$lib/services/namespaces-service';
  import { fetchLatestUiVersion } from '$lib/services/github-service';
  import { fetchSearchAttributes } from '$lib/services/search-attributes-service';
  import { getDefaultNamespace } from '$lib/utilities/get-namespace';
  import { isAuthorized } from '$lib/utilities/is-authorized';
  import { routeForLoginPage } from '$lib/utilities/route-for';
  import { getAuthUserCookie } from '$lib/utilities/get-auth-user-cookie';

  export const load: Load = async function ({ fetch }) {
    const settings: Settings = await fetchSettings(fetch);

    const authUser = getAuthUserCookie();
    if (authUser?.accessToken) {
      setAuthUser(authUser);
    }

    const user = getAuthUser();

    if (!isAuthorized(settings, user)) {
      return {
        status: 302,
        redirect: routeForLoginPage(),
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

    fetchSearchAttributes(settings);

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
  import { updated } from '$app/stores';
  import Header from './_header.svelte';
  import Notifications from '$lib/components/notifications.svelte';
  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/components/error-boundary';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';

  export let user: User;
  export let uiVersionInfo: UiVersionInfo;

  updated.subscribe(async (value) => {
    if (value) {
      // Hard refresh when version does not match
      window.location.reload();
    }
  });
</script>

<PageTitle />
<div class="flex w-screen flex-row">
  <Notifications />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <Header {user} />
  </div>
  <section id="content" class="min-h-screen w-max flex-auto overflow-auto">
    <Banners {uiVersionInfo} />
    <div class="z-10 flex flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
    <ScrollToTop />
  </section>
</div>
