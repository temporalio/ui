<script lang="ts">
  import { page } from '$app/stores';
  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSchedules,
    routeForSettings,
  } from '$lib/utilities/route-for';

  import NamespaceSelect from './_namespace-select.svelte';
  import NavigationLink from '$lib/components/navigation-link.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import NavigationHeader from '$lib/components/navigation-header.svelte';
  import AuthButton from '$lib/components/auth-button.svelte';

  $: namespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;

  export let user: User;
</script>

<NavigationHeader href={routeForWorkflows({ namespace })}>
  <svelte:fragment slot="logo">
    <NamespaceSelect />
  </svelte:fragment>
  <svelte:fragment slot="links">
    <NavigationLink href={routeForWorkflows({ namespace })}>
      Workflows
    </NavigationLink>
    <NavigationLink href={routeForSchedules({ namespace })}>
      Schedules
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
</NavigationHeader>
