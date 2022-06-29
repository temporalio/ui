<script lang="ts">
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { goto } from '$app/navigation';

  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForNamespaces,
  } from '$lib/utilities/route-for';

  import Navigation from '$lib/holocene/navigation/full-nav.svelte';
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import { lastUsedNamespace } from '$lib/stores/namespaces';

  export let user: User;

  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const { isCloud } = $page.stuff.settings.runtimeEnvironment;

  const namespaces = ($page.stuff.namespaces || [])
    .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
    .filter(
      (namespace: string) =>
        showTemporalSystemNamespace || namespace !== 'temporal-system',
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
    home: routeForWorkflows({ namespace: $lastUsedNamespace }),
    archive: routeForArchivalWorkfows({ namespace: $lastUsedNamespace }),
    namespaces: routeForNamespaces(),
    workflows: routeForWorkflows({ namespace: $lastUsedNamespace }),
    feedback:
      $page.stuff?.settings?.feedbackURL ||
      'https://github.com/temporalio/ui/issues/new/choose',
  };

  const logout = () => goto(import.meta.env.VITE_API + '/auth/logout');
</script>

<Navigation
  namespaceList={Promise.resolve(namespaceList)}
  activeNamespace={$lastUsedNamespace}
  {linkList}
  {isCloud}
  user={Promise.resolve(user)}
  {logout}
  extras={[{ component: DataEncoderStatus, name: 'Data Encoder' }]}
/>
