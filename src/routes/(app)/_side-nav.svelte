<script lang="ts">
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSchedules,
    routeForNamespaces,
  } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import { lastUsedNamespace, namespaces } from '$lib/stores/namespaces';

  const { isCloud } = $page.data?.settings?.runtimeEnvironment;

  $: activeNamespaceName = $page.params?.namespace ?? $lastUsedNamespace;
  $: activeNamespace = $namespaces.find(
    (namespace: Namespace) =>
      namespace?.namespaceInfo?.name === activeNamespaceName,
  );

  $: linkList = {
    home: routeForWorkflows({ namespace: activeNamespaceName }),
    archive: routeForArchivalWorkfows({ namespace: activeNamespaceName }),
    namespaces: routeForNamespaces(),
    schedules: routeForSchedules({ namespace: activeNamespaceName }),
    workflows: routeForWorkflows({ namespace: activeNamespaceName }),
    feedback:
      $page.data?.settings?.feedbackURL ||
      'https://github.com/temporalio/ui/issues/new/choose',
  };
</script>

<Navigation {activeNamespace} {linkList} {isCloud} />
