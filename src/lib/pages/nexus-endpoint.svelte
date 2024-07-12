<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusEndpoint } from '$lib/types/nexus';
  import {
    routeForNamespace,
    routeForNexus,
    routeForNexusEndpointEdit,
  } from '$lib/utilities/route-for';

  export let endpoint: NexusEndpoint;
</script>

<div class="flex flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title" class="text-2xl">
        {endpoint.spec.name}
      </h1>
      <Button href={routeForNexusEndpointEdit(endpoint.id)}
        >{translate('common.edit')}</Button
      >
    </div>
    <p>UUID: {endpoint.id}</p>
  </div>
  <div
    class="surface-primary max-w-fit rounded-lg border-2 border-secondary p-4"
  >
    <h4>Target</h4>
    <div class="flex flex-col gap-4 lg:flex-row">
      <div class="flex gap-1">
        Namespace <i>{endpoint.spec.target.worker.namespace}</i>
      </div>
      <div class="flex gap-1">
        Task Queue <i>{endpoint.spec.target.worker.taskQueue}</i>
      </div>
    </div>
  </div>
  <h2 class="text-xl">Description</h2>
  <p class="w-full whitespace-pre-wrap xl:w-1/2">
    {endpoint.spec?.descriptionString || 'No description provided'}
  </p>
  {#if endpoint.spec?.allowedCallerNamespaces}
    <h2 class="text-xl">Allowed Caller Namespaces</h2>
    <div class="flex flex-wrap items-center gap-4">
      {#each endpoint.spec?.allowedCallerNamespaces as namespace}
        <Link href={routeForNamespace({ namespace })}>{namespace}</Link>
      {/each}
    </div>
  {/if}
</div>