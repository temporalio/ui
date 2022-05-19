<script lang="ts">
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { goto } from '$app/navigation';

  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSettings,
  } from '$lib/utilities/route-for';
  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const { isCloud } = $page.stuff.settings.runtimeEnvironment;

  import Navigation from 'holocene/components/navigation/index.svelte';

  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';

  $: namespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  let namespaces = ($page.stuff.namespaces || [])
    .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
    .filter(
      (namespace: string) =>
        showTemporalSystemNamespace || namespace !== 'temporal-system',
    );

  export let user: User;
  const namespaceList = namespaces.map((namespace) => {
    const href = routeForWorkflows({ namespace });
    return { namespace, href, onClick: () => goto(href) };
  });
  $: linkList = {
    home: routeForWorkflows({ namespace }),
    archive: routeForArchivalWorkfows({ namespace }),
    settings: routeForSettings({ namespace }),
    workflows: routeForWorkflows({ namespace }),
  };

  const logout = () => goto(import.meta.env.VITE_API + '/auth/logout');
</script>

<Navigation
  theme="developer"
  {namespaceList}
  activeNamespace={namespace}
  {linkList}
  {isCloud}
  user={Promise.resolve(user)}
  {logout}
  extras={[{ icon: DataEncoderStatus, name: 'Data Encoder' }]}
/>
