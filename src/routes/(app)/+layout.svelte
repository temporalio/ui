<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import type { PageData } from './$types';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { page, updated } from '$app/stores';
  import { clearAuthUser } from '$lib/stores/auth-user';
  import { goto } from '$app/navigation';
  import {
    routeForArchivalWorkfows,
    routeForEventHistoryImport,
    routeForLoginPage,
    routeForNamespaces,
    routeForSchedules,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  import Banners from '$lib/components/banner/banners.svelte';
  import { ErrorBoundary } from '$lib/holocene/error-boundary';
  import Toaster from '$lib/holocene/toaster.svelte';
  import { toaster } from '$lib/stores/toaster';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
  import { workflowFilters } from '$lib/stores/filters';
  import MainContentContainer from '$lib/holocene/main-content-container.svelte';
  import SideNavigation from '$lib/holocene/navigation/side-nav.svelte';
  import TopNavigation from '$lib/holocene/navigation/top-nav.svelte';
  import DataEncoderSettings from '$lib/holocene/data-encoder-settings.svelte';

  export let data: PageData;

  $: ({ uiVersionInfo } = data);

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;
  $: activeNamespaceName = $page.params?.namespace ?? $lastUsedNamespace;
  $: activeNamespace = $namespaces.find(
    (namespace: Namespace) =>
      namespace?.namespaceInfo?.name === activeNamespaceName,
  );
  $: namespaceNames = isCloud
    ? [$page.params.namespace]
    : $namespaces.map((namespace: Namespace) => namespace?.namespaceInfo?.name);
  $: namespaceList = namespaceNames.map((namespace: string) => {
    const getHref = (namespace: string) =>
      isCloud ? routeForWorkflows({ namespace }) : getCurrentHref(namespace);
    return {
      namespace,
      href: (namespace: string) => getHref(namespace),
      onClick: (namespace: string) => {
        $lastUsedNamespace = namespace;
        $workflowFilters = [];
        goto(getHref(namespace));
      },
    };
  });

  $: linkList = {
    home: routeForWorkflows({ namespace: activeNamespaceName }),
    archive: routeForArchivalWorkfows({ namespace: activeNamespaceName }),
    namespaces: routeForNamespaces(),
    schedules: routeForSchedules({ namespace: activeNamespaceName }),
    workflows: routeForWorkflows({ namespace: activeNamespaceName }),
    import: routeForEventHistoryImport(),
    feedback:
      $page.data?.settings?.feedbackURL ||
      'https://github.com/temporalio/ui/issues/new/choose',
  };

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

  afterNavigate(() => {
    document.getElementById('content')?.scrollTo(0, 0);
  });
</script>

<div class="flex w-screen flex-row">
  <Toaster pop={toaster.pop} toasts={toaster.toasts} />
  <div class="sticky top-0 z-20 h-screen w-auto">
    <SideNavigation {activeNamespace} {linkList} {isCloud} />
  </div>
  <MainContentContainer>
    <DataEncoderSettings />
    <TopNavigation {logout} {namespaceList} />
    <Banners {uiVersionInfo} />
    <div class="z-10 -mt-4 flex w-full flex-col gap-4 px-10 pb-10 pt-8">
      <ErrorBoundary onError={() => {}}>
        <slot />
      </ErrorBoundary>
    </div>
  </MainContentContainer>
</div>
