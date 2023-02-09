<script lang="ts">
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { goto } from '$app/navigation';

  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSchedules,
    routeForNamespaces,
    routeForLoginPage,
    routeForSettings,
  } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import DataEncoderStatus from '$lib/holocene/data-encoder-status.svelte';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';
  import { clearAuthUser } from '$lib/stores/auth-user';
  import { workflowSorts, workflowFilters } from '$lib/stores/filters';

  export let user: User;

  const { isCloud } = $page.data?.settings?.runtimeEnvironment;

  $: namespaceNames = isCloud
    ? [$page.params.namespace]
    : $namespaces.map((namespace: Namespace) => namespace?.namespaceInfo?.name);
  $: activeNamespaceName = $page.params?.namespace ?? $lastUsedNamespace;
  $: activeNamespace = $namespaces.find(
    (namespace: Namespace) =>
      namespace?.namespaceInfo?.name === activeNamespaceName,
  );

  function getCurrentHref(namespace: string) {
    const onSchedulesPage = $page.url.pathname.endsWith('schedules');
    const href = onSchedulesPage
      ? routeForSchedules({ namespace })
      : routeForWorkflows({ namespace });
    return href;
  }

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

  $: linkList = {
    home: routeForWorkflows({ namespace: activeNamespaceName }),
    archive: routeForArchivalWorkfows({ namespace: activeNamespaceName }),
    namespaces: routeForNamespaces(),
    schedules: routeForSchedules({ namespace: activeNamespaceName }),
    workflows: routeForWorkflows({ namespace: activeNamespaceName }),
    feedback:
      $page.data?.settings?.feedbackURL ||
      'https://github.com/temporalio/ui/issues/new/choose',
    settings: routeForSettings(),
  };

  const logout = () => {
    clearAuthUser();
    goto(routeForLoginPage());
  };
</script>

<Navigation
  getNamespaceList={() => Promise.resolve(namespaceList)}
  {activeNamespace}
  {linkList}
  {isCloud}
  user={Promise.resolve(user)}
  {logout}
  extras={[
    {
      component: DataEncoderStatus,
      name: 'Data Encoder',
    },
  ]}
/>
