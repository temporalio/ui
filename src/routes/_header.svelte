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
  } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import DataEncoderStatus from '$lib/holocene/data-encoder-status.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { showDataEncoderSettings } from '$lib/stores/show-data-encoder';
  import { clearUser } from '$lib/stores/user';

  export let user: User;

  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const { isCloud } = $page.stuff.settings.runtimeEnvironment;

  const namespaces = ($page.stuff.namespaces || [])
    .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
    .filter(
      (namespace: string) =>
        showTemporalSystemNamespace || namespace !== 'temporal-system',
    );

  $: activeNamespaceName = $page.params?.namespace ?? $lastUsedNamespace;
  $: activeNamespace = ($page.stuff.namespaces || []).find(
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

  let namespaceList = namespaces.map((namespace: string) => {
    return {
      namespace,
      href: (namespace: string) => getCurrentHref(namespace),
      onClick: (namespace: string) => {
        $lastUsedNamespace = namespace;
        goto(getCurrentHref(namespace));
      },
    };
  });

  // To show single namespace on cloud
  if (isCloud && $page.params.namespace && !namespaces.length) {
    namespaceList.push({
      namespace: $page.params.namespace,
      href: (namespace: string) => routeForWorkflows({ namespace }),
      onClick: (namespace: string) => {
        $lastUsedNamespace = $page.params.namespace;
        goto(routeForWorkflows({ namespace }));
      },
    });
  }

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

  const logout = () => {
    clearUser;
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
      onClick: () => ($showDataEncoderSettings = true),
    },
  ]}
/>
