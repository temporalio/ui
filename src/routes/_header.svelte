<script lang="ts">
  import { page } from '$app/stores';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSettings,
  } from '$lib/utilities/route-for';
  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const { isCloud } = $page.stuff.settings.runtimeEnvironment;

  import Navigation from 'holocene/components/navigation/index.svelte';

  import NamespaceSelect from './_namespace-select.svelte';
  import NavigationLink from '$lib/components/navigation-link.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import NavigationHeader from '$lib/components/navigation-header.svelte';
  import AuthButton from '$lib/components/auth-button.svelte';

  $: namespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  let namespaces = ($page.stuff.namespaces || [])
    .map((namespace: Namespace) => namespace?.namespaceInfo?.name)
    .filter(
      (namespace: string) =>
        showTemporalSystemNamespace || namespace !== 'temporal-system',
    );

  export let user: User;
</script>

<Navigation {namespaces} />
<!-- <NavigationHeader href={routeForWorkflows({ namespace })} {user}>
  <svelte:fragment slot="logo">
    <NamespaceSelect />
  </svelte:fragment>
  <svelte:fragment slot="links">
    <NavigationLink href={routeForWorkflows({ namespace })}>
      Workflows
    </NavigationLink>
    <IsCloudGuard>
      <NavigationLink href={routeForSettings({ namespace })}>
        Settings
      </NavigationLink>
      <NavigationLink href={routeForArchivalWorkfows({ namespace })}>
        Archival
      </NavigationLink>
    </IsCloudGuard>
  </svelte:fragment>
  <svelte:fragment slot="user">
    <AuthButton {user} />
  </svelte:fragment>
</NavigationHeader> -->
