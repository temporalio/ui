<script lang="ts">
  import type { Snippet } from 'svelte';

  import { afterNavigate, goto } from '$app/navigation';
  import { page, updated } from '$app/state';

  import BottomNavigation from '$lib/components/bottom-nav.svelte';
  import DataEncoderSettings from '$lib/components/data-encoder-settings.svelte';
  import NamespacePicker from '$lib/components/namespace-picker.svelte';
  import SideNavigation from '$lib/components/side-nav.svelte';
  import SkipNavigation from '$lib/components/skip-nav.svelte';
  import TopNavigation from '$lib/components/top-nav.svelte';
  import ErrorBoundary from '$lib/holocene/error-boundary.svelte';
  import MainContentContainer from '$lib/holocene/main-content-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import Toaster from '$lib/holocene/toaster.svelte';
  import UserMenuMobile from '$lib/holocene/user-menu-mobile.svelte';
  import UserMenu from '$lib/holocene/user-menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser, clearAuthUser } from '$lib/stores/auth-user';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
  import { toaster } from '$lib/stores/toaster';
  import type { NamespaceListItem, NavLinkListItem } from '$lib/types/global';
  import { setCoreContext } from '$lib/utilities/core-context';
  import DarkMode from '$lib/utilities/dark-mode';
  import {
    routeForArchivalWorkflows,
    routeForBatchOperations,
    routeForEventHistoryImport,
    routeForLoginPage,
    routeForNamespaces,
    routeForNexus,
    routeForSchedules,
    routeForWorkers,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let isCloud = $derived(page.data?.settings?.runtimeEnvironment?.isCloud);
  let activeNamespaceName = $derived(
    page.params?.namespace ?? $lastUsedNamespace,
  );
  let namespaceNames = $derived(
    isCloud
      ? [page.params.namespace]
      : $namespaces.map(
          (namespace: Namespace) => namespace?.namespaceInfo?.name,
        ),
  );
  let namespaceList: NamespaceListItem[] = $derived(
    namespaceNames.map((namespace: string) => {
      const getHref = (namespace: string) =>
        isCloud ? routeForWorkflows({ namespace }) : getCurrentHref(namespace);
      return {
        namespace,
        onClick: (namespace: string) => {
          $lastUsedNamespace = namespace;
          goto(getHref(namespace));
        },
      };
    }),
  );

  const getRoutes = (namespace: string) => {
    return {
      workflowsRoute: routeForWorkflows({ namespace }),
      schedulesRoute: routeForSchedules({ namespace }),
      batchOperationsRoute: routeForBatchOperations({ namespace }),
      workersRoute: routeForWorkers({ namespace }),
      archivalRoute: routeForArchivalWorkflows({ namespace }),
      namespacesRoute: routeForNamespaces(),
      nexusRoute: routeForNexus(),
      historyImportRoute: routeForEventHistoryImport(),
    };
  };

  const getLinkList = (
    {
      workflowsRoute,
      schedulesRoute,
      batchOperationsRoute,
      workersRoute,
      archivalRoute,
      namespacesRoute,
      nexusRoute,
      historyImportRoute,
    }: {
      workflowsRoute: string;
      schedulesRoute: string;
      batchOperationsRoute: string;
      workersRoute: string;
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
          !path.includes(workersRoute) &&
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
        href: workersRoute,
        icon: 'merge',
        label: translate('deployments.deployments'),
        tooltip: translate('deployments.worker-deployments'),
        isActive: (path) => path.includes(workersRoute),
      },
      {
        href: nexusRoute,
        icon: 'nexus',
        label: translate('nexus.nexus'),
        hidden: !page.data?.systemInfo?.capabilities?.nexus,
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
    ];
  };

  let routes = $derived(getRoutes(activeNamespaceName));
  let linkList = $derived(getLinkList(routes, !!$inProgressBatchOperation));
  let {
    workflowsRoute,
    schedulesRoute,
    batchOperationsRoute,
    workersRoute,
    archivalRoute,
  } = $derived(routes);
  let showNamespacePicker = $derived(
    [
      workflowsRoute,
      schedulesRoute,
      workersRoute,
      batchOperationsRoute,
      archivalRoute,
    ].some((route) => page.url.href.includes(route)),
  );

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
    ];

    for (const { subPath, fullRoute } of namespacePages) {
      if (page.url.pathname.endsWith(subPath)) {
        return fullRoute;
      }
    }

    // Handle workers page with view query param preservation
    if (page.url.pathname.endsWith('workers')) {
      const view = page.url.searchParams.get('view');
      const base = routeForWorkers({ namespace });
      return view ? `${base}?view=${view}` : base;
    }

    // Handle legacy worker-deployments path during redirect
    if (page.url.pathname.includes('worker-deployments')) {
      return `${routeForWorkers({ namespace })}?view=deployments`;
    }

    return routeForWorkflows({ namespace });
  }

  const logout = () => {
    clearAuthUser();
    goto(routeForLoginPage());
  };

  $effect(() => {
    if (updated.current) {
      // Hard refresh when version does not match
      window.location.reload();
    }
  });

  afterNavigate(() => {
    document.getElementById('content')?.scrollTo(0, 0);
  });

  setCoreContext({
    getUserIdentifier: () => $authUser.email || '',
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
    <SideNavigation {linkList} {isCloud}>
      <NavigationItem
        link={page.data?.settings?.feedbackURL ||
          'https://github.com/temporalio/ui/issues/new/choose'}
        label={translate('common.feedback')}
        icon="feedback"
        tooltip={translate('common.feedback')}
        external
        slot="bottom"
      />
    </SideNavigation>
  </div>
  <MainContentContainer>
    <DataEncoderSettings />
    <TopNavigation>
      {#snippet left()}
        {#if showNamespacePicker}
          <NamespacePicker {namespaceList} />
        {/if}
      {/snippet}
      <UserMenu {logout} />
    </TopNavigation>
    <div
      slot="main"
      class="flex h-[calc(100%-2.5rem)] w-full flex-col gap-4 p-4 md:p-8"
    >
      <ErrorBoundary>
        {@render children()}
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
