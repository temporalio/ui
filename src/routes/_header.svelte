<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSchedules,
    routeForNamespaces,
    routeForLoginPage,
  } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import DataEncoderStatus from '$lib/holocene/data-encoder-status.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { showDataEncoderSettings } from '$lib/stores/show-data-encoder';
  import { clearAuthUser } from '$lib/stores/auth-user';
  import { workflowSorts, workflowFilters } from '$lib/stores/filters';
  import { fetchNamespaces } from '$lib/services/namespaces-service';

  import type { ListNamespacesResponse } from '$types';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  export let user: User;

  const {
    showTemporalSystemNamespace,
    runtimeEnvironment: { isCloud },
  } = $page.stuff.settings;

  $: activeNamespaceName = $page.params?.namespace ?? $lastUsedNamespace;
  $: linkList = {
    home: routeForWorkflows({ namespace: activeNamespaceName }),
    archive: routeForArchivalWorkfows({ namespace: activeNamespaceName }),
    namespaces: routeForNamespaces(),
    schedules: routeForSchedules({ namespace: activeNamespaceName }),
    workflows: routeForWorkflows({ namespace: activeNamespaceName }),
    feedback:
      $page.stuff?.settings?.feedbackURL ||
      'https://github.com/temporalio/ui/issues/new/choose',
  };

  const namespacesPromise: Promise<ListNamespacesResponse> = fetchNamespaces(
    $page.stuff.settings,
  );
  const activeNamespace: Promise<Namespace> = namespacesPromise.then(
    ({ namespaces }) =>
      namespaces.find(
        (namespace) => namespace?.namespaceInfo?.name === activeNamespaceName,
      ),
  );
  const getNamespaces = (): Promise<NamespaceItem[]> =>
    namespacesPromise.then(({ namespaces }) => getNamespaceList(namespaces));

  function getCurrentHref(namespace: string) {
    const onSchedulesPage = $page.url.pathname.endsWith('schedules');
    const href = onSchedulesPage
      ? routeForSchedules({ namespace })
      : routeForWorkflows({ namespace });
    return href;
  }

  function getNamespaceList(namespaces: Namespace[]) {
    const filteredNamespaces: string[] = namespaces
      .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
      .filter(
        (namespace: string) =>
          showTemporalSystemNamespace || namespace !== 'temporal-system',
      );
    let namespaceList = filteredNamespaces.map((namespace: string) => {
      return {
        namespace,
        href: (namespace: string) => getCurrentHref(namespace),
        onClick: (namespace: string) => {
          $lastUsedNamespace = namespace;
          $workflowFilters = [];
          $workflowSorts = [];
          goto(getCurrentHref(namespace));
        },
      };
    });

    // To show single namespace on cloud
    if (isCloud && $page.params.namespace && !filteredNamespaces.length) {
      namespaceList.push({
        namespace: $page.params.namespace,
        href: (namespace: string) => routeForWorkflows({ namespace }),
        onClick: (namespace: string) => {
          $lastUsedNamespace = $page.params.namespace;
          $workflowFilters = [];
          $workflowSorts = [];
          goto(routeForWorkflows({ namespace }));
        },
      });
    }
    return namespaceList;
  }

  const logout = () => {
    clearAuthUser();
    goto(routeForLoginPage());
  };
</script>

<Navigation
  getNamespaceList={getNamespaces}
  {activeNamespace}
  {linkList}
  {isCloud}
  user={Promise.resolve(user)}
  {logout}
  extras={[
    {
      component: DataEncoderStatus,
      name: 'Data Encoder',
      onClick: () => ($showDataEncoderSettings = true),
    },
  ]}
/>
