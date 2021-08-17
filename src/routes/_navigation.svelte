<script lang="ts">
  import { getContext } from 'svelte';

  import type { DescribeNamespaceResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  import {
    Photograph,
    Collection,
    DocumentSearch,
    Identification,
  } from 'svelte-hero-icons';
  import NavigationLink from './_navigation-link.svelte';
  import { goto } from '$app/navigation';

  $: namespace = getContext('namespace') as string;
  $: namespaces = (getContext('namespaces') as DescribeNamespaceResponse[]).map(
    (namespace) => namespace.namespaceInfo.name,
  );

  const changeNamespace = (event: Event) => {
    const select: HTMLSelectElement = event.currentTarget as HTMLSelectElement;
    goto('/namespaces/' + select.value);
  };
</script>

<nav
  id="sidebar"
  class="w-28 h-screen py-6 flex flex-col items-center bg-black"
>
  <img src="/logo.svg" alt="Temporal Logo" class="rounded-full w-12" />
  <div class="m-6 text-white text-center">
    <h3 class="text-sm font-bold">Namespace</h3>
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={namespace} on:change={changeNamespace}>
      {#each namespaces as namespace}
        <option value={namespace}>{namespace}</option>
      {/each}
    </select>
  </div>
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
