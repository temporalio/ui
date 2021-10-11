<script lang="ts">
  import { namespace } from '$lib/stores/namespace';

  import NavigationLink from './_navigation-link.svelte';
</script>

<nav
  id="sidebar"
  class="w-12 h-screen py-6 flex flex-col space-y-6 items-center bg-black"
>
  <img src="/logo.svg" alt="Temporal Logo" class="rounded-full w-12" />
  <NavigationLink
    href={`/namespaces/${$namespace}/report`}
    label="Home"
    icon="Home"
  />
  <NavigationLink
    href={`/namespaces/${$namespace}/workflows`}
    label="Workflows"
    icon={'Photograph'}
  />
  <NavigationLink href="/cluster" label="Cluster" icon={'Collection'} />
  <NavigationLink
    href="/search-attributes"
    label="Search Attributes"
    icon={'DocumentSearch'}
  />
  <NavigationLink
    href={`/namespaces/${$namespace}/settings`}
    label="Settings"
    icon={'Identification'}
  />
</nav>
