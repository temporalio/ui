<script lang="ts">
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$lib/types';
  import { goto } from '$app/navigation';

  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSchedules,
    routeForNamespaces,
  } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { getApiOrigin } from '$lib/utilities/get-api-origin';

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

  const namespaceList = namespaces.map((namespace: string) => {
    const href = routeForWorkflows({ namespace });
    return {
      namespace,
      href,
      onClick: () => {
        $lastUsedNamespace = namespace;
        goto(routeForWorkflows({ namespace }));
      },
    };
  });

  // To show single namespace on cloud
  if (isCloud && $page.params.namespace && !namespaces.length) {
    const href = routeForWorkflows({ namespace: $page.params.namespace });
    namespaceList.push({
      namespace: $page.params.namespace,
      href,
      onClick: () => {
        $lastUsedNamespace = $page.params.namespace;
        goto(href);
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

  const logout = () => goto(getApiOrigin() + '/auth/logout');
</script>

<Navigation
  getNamespaceList={() => Promise.resolve(namespaceList)}
  {activeNamespace}
  {linkList}
  {isCloud}
  user={Promise.resolve(user)}
  {logout}
  extras={[{ component: DataEncoderStatus, name: 'Data Encoder' }]}
/>
