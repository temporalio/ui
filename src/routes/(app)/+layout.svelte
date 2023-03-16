<script lang="ts">
  import type { PageData } from './$types';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { page, updated } from '$app/stores';
  import { clearAuthUser } from '$lib/stores/auth-user';
  import { goto } from '$app/navigation';
  import {
    routeForLoginPage,
    routeForSchedules,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  import SideNavigation from './_side-nav.svelte';
  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/holocene/error-boundary';
  import ScrollToTop from '$lib/holocene/scroll-to-top.svelte';
  import Toaster from '$lib/holocene/toaster.svelte';
  import { toaster } from '$lib/stores/toaster';
  import TopNavigation from '$lib/components/top-nav.svelte';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';

  export let data: PageData;

  $: ({ uiVersionInfo } = data);

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;
  $: namespaceNames = isCloud
    ? [$page.params.namespace]
    : $namespaces.map((namespace: Namespace) => namespace?.namespaceInfo?.name);
  $: namespaceList = namespaceNames.map((namespace: string) => {
    const getHref = (namespace) =>
      isCloud ? routeForWorkflows({ namespace }) : getCurrentHref(namespace);
    return {
      namespace,
      href: (namespace: string) => getHref(namespace),
      onClick: (namespace: string) => {
        $lastUsedNamespace = namespace;
        $workflowFilters = [];
        $workflowSorts = [];
        goto(getHref(namespace));
      },
    };
  });

  function getCurrentHref(namespace: string) {
    const onSchedulesPage = $page.url.pathname.endsWith('schedules');
    const href = onSchedulesPage
      ? routeForSchedules({ namespace })
      : routeForWorkflows({ namespace });
    return href;
  }

  const logout = () => {
    clearAuthUser();
    goto(routeForLoginPage());
  };

  updated.subscribe(async (value) => {
    if (value) {
      // Hard refresh when version does not match
      window.location.reload();
    }
  });
</script>

<div class="flex w-screen flex-row">
  <Toaster pop={toaster.pop} toasts={toaster.toasts} />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <SideNavigation />
  </div>
  <main id="content" class="h-screen w-max flex-auto overflow-auto bg-gray-100">
    <TopNavigation {logout} {namespaceList} />
    <Banners {uiVersionInfo} />
    <div class="z-10 -mt-4 flex w-full flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
    <ScrollToTop />
  </main>
</div>
