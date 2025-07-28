<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page, updated } from '$app/stores';

  import BottomNavigation from '$lib/components/bottom-nav.svelte';
  import DataEncoderSettings from '$lib/components/data-encoder-settings.svelte';
  import NamespacePicker from '$lib/components/namespace-picker.svelte';
  import SideNavigation from '$lib/components/side-nav.svelte';
  import SkipNavigation from '$lib/components/skip-nav.svelte';
  import TopNavigation from '$lib/components/top-nav.svelte';
  import ErrorBoundary from '$lib/holocene/error-boundary.svelte';
  import MainContentContainer from '$lib/holocene/main-content-container.svelte';
  import Toaster from '$lib/holocene/toaster.svelte';
  import UserMenuMobile from '$lib/holocene/user-menu-mobile.svelte';
  import UserMenu from '$lib/holocene/user-menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { clearAuthUser } from '$lib/stores/auth-user';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
  import { toaster } from '$lib/stores/toaster';
  import type { NamespaceListItem, NavLinkListItem } from '$lib/types/global';
  import DarkMode from '$lib/utilities/dark-mode';
  import {
    routeForArchivalWorkfows,
    routeForBatchOperations,
    routeForEventHistoryImport,
    routeForLoginPage,
    routeForNamespaces,
    routeForNexus,
    routeForSchedules,
    routeForWorkerDeployments,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  let namespaceList: NamespaceListItem[];

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;
  $: activeNamespaceName = $page.params?.namespace ?? $lastUsedNamespace;
  $: namespaceNames = isCloud
    ? [$page.params.namespace]
    : $namespaces.map((namespace: Namespace) => namespace?.namespaceInfo?.name);
  $: namespaceList = namespaceNames.map((namespace: string) => {
    const getHref = (namespace: string) =>
      isCloud ? routeForWorkflows({ namespace }) : getCurrentHref(namespace);
    return {
      namespace,
      onClick: (namespace: string) => {
        $lastUsedNamespace = namespace;
        goto(getHref(namespace));
      },
    };
  });

  $: routes = getRoutes(activeNamespaceName);
  $: linkList = getLinkList(routes, !!$inProgressBatchOperation);

  const getRoutes = (namespace: string) => {
    return {
      workflowsRoute: routeForWorkflows({ namespace }),
      schedulesRoute: routeForSchedules({ namespace }),
      batchOperationsRoute: routeForBatchOperations({ namespace }),
      workerDeploymentsRoute: routeForWorkerDeployments({ namespace }),
      archivalRoute: routeForArchivalWorkfows({ namespace }),
      namespacesRoute: routeForNamespaces(),
      nexusRoute: routeForNexus(),
      historyImportRoute: routeForEventHistoryImport(),
    };
  };

  $: ({
    workflowsRoute,
    schedulesRoute,
    batchOperationsRoute,
    workerDeploymentsRoute,
    archivalRoute,
  } = routes);
  $: showNamespacePicker = [
    workflowsRoute,
    schedulesRoute,
    workerDeploymentsRoute,
    batchOperationsRoute,
    archivalRoute,
  ].some((route) => $page.url.href.includes(route));

  const getLinkList = (
    {
      workflowsRoute,
      schedulesRoute,
      batchOperationsRoute,
      workerDeploymentsRoute,
      archivalRoute,
      namespacesRoute,
      nexusRoute,
      historyImportRoute,
    }: {
      workflowsRoute: string;
      schedulesRoute: string;
      batchOperationsRoute: string;
      workerDeploymentsRoute: string;
      archivalRoute: string;
      namespacesRoute: string;
      nexusRoute: string;
      historyImportRoute: string;
    },
    inProgressBatch: boolean,
  ): NavLinkListItem[] => {
    return [
      {
        href: namespacesRoute,
        icon: 'namespace',
        label: translate('common.namespaces'),
        isActive: (path) =>
          path.includes(namespacesRoute) &&
          !path.includes(workflowsRoute) &&
          !path.includes(schedulesRoute) &&
          !path.includes(batchOperationsRoute) &&
          !path.includes(workerDeploymentsRoute) &&
          !path.includes(archivalRoute),
      },
      {
        href: workflowsRoute,
        icon: 'workflow',
        label: translate('common.workflows'),
        isActive: (path) => path.includes(workflowsRoute),
      },
      {
        href: schedulesRoute,
        icon: 'schedules',
        label: translate('common.schedules'),
        isActive: (path) => path.includes(schedulesRoute),
      },
      {
        href: batchOperationsRoute,
        icon: 'batch-operation',
        label: translate('batch.nav-title'),
        tooltip: translate('batch.list-page-title'),
        animate: inProgressBatch,
        isActive: (path) => path.includes(batchOperationsRoute),
      },
      {
        href: workerDeploymentsRoute,
        icon: 'merge',
        label: translate('deployments.deployments'),
        tooltip: translate('deployments.worker-deployments'),
        isActive: (path) => path.includes(workerDeploymentsRoute),
      },
      {
        href: nexusRoute,
        icon: 'nexus',
        label: translate('nexus.nexus'),
        hidden: !$page.data?.systemInfo?.capabilities?.nexus,
        isActive: (path) => {
          const match = path.split('/').find((segment) => segment === 'nexus');
          return !!match;
        },
      },
      {
        href: archivalRoute,
        icon: 'archives',
        divider: true,
        label: translate('common.archive'),
        isActive: (path) => path.includes(archivalRoute),
      },
      {
        href: historyImportRoute,
        icon: 'import',
        label: translate('common.import'),
        isActive: (path) => path.includes(historyImportRoute),
      },
      {
        href: 'http://docs.temporal.io',
        icon: 'book',
        label: translate('common.docs'),
        external: true,
      },
      {
        href:
          $page.data?.settings?.feedbackURL ||
          'https://github.com/temporalio/ui/issues/new/choose',
        icon: 'feedback',
        label: translate('common.feedback'),
        external: true,
      },
    ];
  };

  function getCurrentHref(namespace: string) {
    const namespacePages = [
      {
        subPath: 'schedules',
        fullRoute: routeForSchedules({ namespace }),
      },
      {
        subPath: 'batch-operations',
        fullRoute: routeForBatchOperations({ namespace }),
      },
      {
        subPath: 'worker-deployments',
        fullRoute: routeForWorkerDeployments({ namespace }),
      },
    ];

    for (const { subPath, fullRoute } of namespacePages) {
      if ($page.url.pathname.endsWith(subPath)) {
        return fullRoute;
      }
    }

    return routeForWorkflows({ namespace });
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

<DarkMode />
<SkipNavigation />

<div class="flex w-screen flex-row">
  <Toaster
    closeButtonLabel={translate('common.close')}
    pop={toaster.pop}
    toasts={toaster.toasts}
    position={toaster.position}
  />
  <div class="sticky top-0 z-30 hidden h-screen w-auto md:block">
    <SideNavigation {linkList} {isCloud} />
  </div>
  <MainContentContainer>
    <DataEncoderSettings class="hidden md:flex" />
    <TopNavigation>
      <svelte:fragment slot="left">
        {#if showNamespacePicker}
          <NamespacePicker {namespaceList} />
        {/if}
      </svelte:fragment>
      <UserMenu {logout} />
    </TopNavigation>
    <div
      slot="main"
      class="flex h-[calc(100%-2.5rem)] w-full flex-col gap-4 p-4 md:p-8"
    >
      <ErrorBoundary>
        <slot />
      </ErrorBoundary>
    </div>
    <BottomNavigation
      slot="footer"
      {linkList}
      {namespaceList}
      {isCloud}
      {showNamespacePicker}
    >
      <UserMenuMobile {logout} />
    </BottomNavigation>
  </MainContentContainer>
</div>
