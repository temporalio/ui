<script lang="ts">
  import type { Snippet } from 'svelte';

  import { afterNavigate, goto } from '$app/navigation';
  import { page, updated } from '$app/state';

  import BottomNavigation from '$lib/components/bottom-nav.svelte';
  import DataEncoderSettings from '$lib/components/data-encoder-settings.svelte';
  import NamespacePicker from '$lib/components/namespace-picker.svelte';
  import NewsFeedWidget from '$lib/components/news-feed/news-feed-widget.svelte';
  import SideNavigation from '$lib/components/side-nav.svelte';
  import SkipNavigation from '$lib/components/skip-nav.svelte';
  import TopNavigation from '$lib/components/top-nav.svelte';
  import ErrorBoundary from '$lib/holocene/error-boundary.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MainContentContainer from '$lib/holocene/main-content-container.svelte';
  import NavigationItem from '$lib/holocene/navigation/navigation-item.svelte';
  import Toaster from '$lib/holocene/toaster.svelte';
  import UserMenuMobile from '$lib/holocene/user-menu-mobile.svelte';
  import UserMenu from '$lib/holocene/user-menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser, logout as logoutAuthUser } from '$lib/stores/auth-user';
  import { inProgressBatchOperation } from '$lib/stores/batch-operations';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
  import { initializeNavDefaults } from '$lib/stores/nav-open';
  import { toaster } from '$lib/stores/toaster';
  import { temporalVersion } from '$lib/stores/versions';
  import { type NamespaceListItem, type NavLinkItem } from '$lib/types/global';
  import { setCoreContext } from '$lib/utilities/core-context';
  import DarkMode from '$lib/utilities/dark-mode';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { namespaceCapabilityState } from '$lib/utilities/namespace-capabilities';
  import {
    routeForArchivalWorkflows,
    routeForBatchOperations,
    routeForEventHistoryImport,
    routeForNamespaces,
    routeForNexus,
    routeForSchedules,
    routeForStandaloneActivities,
    routeForStandaloneNexusOperations,
    routeForWorkerDeployments,
    routeForWorkers,
    routeForWorkflows,
  } from '$lib/utilities/route-for';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  import type { DescribeNamespaceResponse as Namespace } from '$types';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  initializeNavDefaults(page.data?.settings?.navCollapsedByDefault);

  let isCloud = $derived(page.data?.settings?.runtimeEnvironment?.isCloud);
  let newsFeedClusterId = $derived(page.data?.cluster?.clusterId ?? '');
  let showNewsFeed = $derived(
    !isCloud && !page.data?.settings?.disableNewsFetch && !!newsFeedClusterId,
  );
  let activeNamespaceName = $derived(
    page.params?.namespace ?? $lastUsedNamespace,
  );
  let namespaceNames = $derived(
    isCloud
      ? [page.params.namespace]
      : $namespaces.map(
          (namespace: Namespace) => namespace?.namespaceInfo?.name as string,
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

  const nexusOperationsLinkHidden = $derived.by(() => {
    const namespace = $namespaces.find(
      (namespace) => namespace.namespaceInfo?.name === activeNamespaceName,
    );
    const capabilityState = namespaceCapabilityState(
      namespace?.namespaceInfo?.capabilities ?? undefined,
      'standaloneNexusOperation',
    );
    return capabilityState === 'unsupported';
  });

  const getRoutes = (namespace: string) => {
    return {
      workflowsRoute: routeForWorkflows({ namespace }),
      standaloneActivitiesRoute: routeForStandaloneActivities({ namespace }),
      standaloneNexusOperationsRoute: routeForStandaloneNexusOperations({
        namespace,
      }),
      schedulesRoute: routeForSchedules({ namespace }),
      batchOperationsRoute: routeForBatchOperations({ namespace }),
      workersRoute: routeForWorkers({ namespace }),
      workerDeploymentsRoute: routeForWorkerDeployments({ namespace }),
      archivalRoute: routeForArchivalWorkflows({ namespace }),
      namespacesRoute: routeForNamespaces(),
      nexusRoute: routeForNexus(),
      historyImportRoute: routeForEventHistoryImport(),
    };
  };

  const getNavPrimaryLinks = (
    {
      workflowsRoute,
      standaloneActivitiesRoute,
      standaloneNexusOperationsRoute,
      schedulesRoute,
      batchOperationsRoute,
      workersRoute,
      workerDeploymentsRoute,
      archivalRoute,
      namespacesRoute,
      nexusRoute,
    }: {
      workflowsRoute: string;
      standaloneActivitiesRoute: string;
      standaloneNexusOperationsRoute: string;
      schedulesRoute: string;
      batchOperationsRoute: string;
      workersRoute: string;
      workerDeploymentsRoute: string;
      archivalRoute: string;
      namespacesRoute: string;
      nexusRoute: string;
      historyImportRoute: string;
    },
    inProgressBatch: boolean,
  ): NavLinkItem[] => {
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
          !path.includes(workerDeploymentsRoute) &&
          !path.includes(standaloneActivitiesRoute) &&
          !path.includes(standaloneNexusOperationsRoute) &&
          !path.includes(archivalRoute),
      },
      {
        href: workflowsRoute,
        icon: 'workflow',
        label: translate('common.workflows'),
        isActive: (path) => path.includes(workflowsRoute),
      },
      {
        href: standaloneActivitiesRoute,
        icon: 'activity',
        label: translate('standalone-activities.standalone-activities'),
        isActive: (path) => path.includes(standaloneActivitiesRoute),
        hidden: !minimumVersionRequired('1.30.0', $temporalVersion),
      },
      {
        href: standaloneNexusOperationsRoute,
        icon: 'nexus',
        label: translate(
          'standalone-nexus-operations.standalone-nexus-operations',
        ),
        isActive: (path) => path.includes(standaloneNexusOperationsRoute),
        hidden: nexusOperationsLinkHidden,
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
        icon: 'workers',
        label: translate('workers.workers'),
        tooltip: translate('workers.workers'),
        isActive: (path) =>
          path.includes(workersRoute) || path.includes(workerDeploymentsRoute),
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
    ];
  };

  const getNavSecondaryLinks = (
    {
      archivalRoute,
      historyImportRoute,
    }: {
      workflowsRoute: string;
      standaloneActivitiesRoute: string;
      schedulesRoute: string;
      batchOperationsRoute: string;
      workerDeploymentsRoute: string;
      archivalRoute: string;
      namespacesRoute: string;
      nexusRoute: string;
      historyImportRoute: string;
    },
    _inProgressBatch: boolean,
  ): NavLinkItem[] => {
    return [
      {
        href: archivalRoute,
        icon: 'archives',
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
  let linkList = $derived(
    getNavPrimaryLinks(routes, !!$inProgressBatchOperation),
  );
  let linkListForSecondGroup = $derived(
    getNavSecondaryLinks(routes, !!$inProgressBatchOperation),
  );
  let {
    workflowsRoute,
    schedulesRoute,
    batchOperationsRoute,
    workersRoute,
    workerDeploymentsRoute,
    archivalRoute,
    standaloneActivitiesRoute,
    standaloneNexusOperationsRoute,
  } = $derived(routes);
  let showNamespacePicker = $derived(
    [
      workflowsRoute,
      schedulesRoute,
      workersRoute,
      workerDeploymentsRoute,
      batchOperationsRoute,
      archivalRoute,
      standaloneActivitiesRoute,
      standaloneNexusOperationsRoute,
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
      {
        subPath: 'activities',
        fullRoute: routeForStandaloneActivities({ namespace }),
      },
      {
        subPath: 'nexus-operations',
        fullRoute: routeForStandaloneNexusOperations({ namespace }),
      },
      {
        subPath: 'workers/deployments',
        fullRoute: routeForWorkerDeployments({ namespace }),
      },
      {
        subPath: 'workers',
        fullRoute: routeForWorkers({ namespace }),
      },
    ];

    const segments = page.url.pathname.split('/').filter(Boolean);
    const namespaceIndex = segments.indexOf(page.params.namespace);
    const sectionSegments = segments.slice(namespaceIndex + 1);

    for (const { subPath, fullRoute } of namespacePages) {
      if (sectionSegments.join('/').startsWith(subPath)) {
        return fullRoute;
      }
    }

    return routeForWorkflows({ namespace });
  }

  const logout = () => {
    void logoutAuthUser();
  };

  $effect(() => {
    if (updated.current) {
      // Hard refresh when version does not match
      window.location.reload();
    }
  });

  afterNavigate(({ from, to, type }) => {
    const main = document.getElementById('content');
    main?.scrollTo(0, 0);
    if (type === 'enter') return;
    if (from?.url.pathname === '/') return;
    if (from?.url.pathname === to?.url.pathname) return;
    main?.focus({ preventScroll: true });
  });

  setCoreContext({
    getUserIdentifier: () => $authUser.email || '',
  });
</script>

<DarkMode />
<SkipNavigation />

<div class="flex h-dvh w-screen flex-row">
  <Toaster
    closeButtonLabel={translate('common.close')}
    pop={toaster.pop}
    toasts={toaster.toasts}
    position={toaster.position}
  />
  <div class="sticky top-0 z-30 hidden h-screen w-auto md:block">
    <SideNavigation sections={[linkList, linkListForSecondGroup]} {isCloud}>
      {#snippet bottom()}
        {#if !isCloud}
          <NavigationItem
            link={page.data?.settings?.feedbackURL ||
              'https://github.com/temporalio/ui/issues/new/choose'}
            label={translate('common.feedback')}
            icon="feedback"
            tooltip={translate('common.feedback')}
            external
          />
        {/if}
      {/snippet}
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
      {#if showNewsFeed}
        <NewsFeedWidget
          clusterId={newsFeedClusterId}
          source="web-ui"
          previewTheme={$useDarkMode ? 'dark' : 'light'}
        />
      {/if}
      {#if isCloud}
        <a
          href={page.data?.settings?.supportURL ||
            'https://support.temporal.io'}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center hover:text-white"
          aria-label="Support"
        >
          <Icon name="support" />
        </a>
      {/if}
      <UserMenu {logout} />
    </TopNavigation>
    {#snippet main()}
      <div class="flex h-[calc(100%-2.5rem)] w-full flex-col gap-4 p-4 md:p-8">
        <ErrorBoundary>
          {@render children()}
        </ErrorBoundary>
      </div>
    {/snippet}
    {#snippet footer()}
      <BottomNavigation {namespaceList} {isCloud} {showNamespacePicker}>
        {#snippet linksSnippet()}
          {#each [...linkListForSecondGroup]
            .filter((item) => !item.hidden)
            .reverse() as link, i (i)}
            <NavigationItem {...link} link={link.href} />
          {/each}

          <hr class="border-subtle" />

          {#each [...linkList]
            .filter((item) => !item.hidden)
            .reverse() as link, i (i)}
            <NavigationItem {...link} link={link.href} />
          {/each}
        {/snippet}
        {#if showNewsFeed}
          <NewsFeedWidget
            clusterId={newsFeedClusterId}
            source="web-ui"
            variant="navigation"
            previewTheme="dark"
          />
        {/if}
        <UserMenuMobile {logout} />
      </BottomNavigation>
    {/snippet}
  </MainContentContainer>
</div>
