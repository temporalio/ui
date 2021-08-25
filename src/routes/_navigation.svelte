<script lang="ts">
  import { getContext } from 'svelte';

  import {
    Photograph,
    Collection,
    DocumentSearch,
    Identification,
  } from 'svelte-hero-icons';
  import NavigationLink from './_navigation-link.svelte';
  import { goto } from '$app/navigation';

  $: namespace = getContext('namespace') as string;
</script>

<nav
  id="sidebar"
  class="w-12 h-screen py-6 flex flex-col space-y-6 items-center bg-black"
>
  <img src="/logo.svg" alt="Temporal Logo" class="rounded-full w-12" />

  <NavigationLink
    href={`/namespaces/${namespace}/workflows`}
    label="Workflows"
    icon={Photograph}
  />
  <NavigationLink href="/cluster" label="Cluster" icon={Collection} />
  <NavigationLink
    href="/search-attributes"
    label="Search Attributes"
    icon={DocumentSearch}
  />
  <NavigationLink
    href={`/namespaces/${namespace}/settings`}
    label="Settings"
    icon={Identification}
  />
</nav>

<style lang="postcss">
  select {
    background: black;
    @apply text-xs w-full;
  }
</style>
