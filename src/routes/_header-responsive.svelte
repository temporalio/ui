<script lang="ts">
  import { page } from '$app/stores';
  import {
    routeForArchivalWorkfows,
    routeForWorkflows,
    routeForSettings,
  } from '$lib/utilities/route-for';

  import NamespaceSelect from './_namespace-select.svelte';
  import NavigationLink from '$lib/components/navigation-link.svelte';
  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import HamburgerHeader from '$lib/components/hamburger-header.svelte';
  import AuthButton from '$lib/components/auth-button.svelte';

  export let user: User;

  $: namespace =
    $page.params.namespace || $page.stuff?.settings?.defaultNamespace;
</script>

<HamburgerHeader href={routeForWorkflows({ namespace })}>
  <svelte:fragment slot="action">
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
</HamburgerHeader>
