<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusService } from '$lib/types/nexus';
  import {
    routeForEditNexusService,
    routeForNexus,
  } from '$lib/utilities/route-for';

  export let service: NexusService;

  const namespaces = [...Array(40).keys()];
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="flex flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title" class="text-2xl">
        {service.name}
      </h1>
      <Button variant="secondary" href={routeForEditNexusService(service.id)}
        >{translate('common.edit')}</Button
      >
    </div>
    <p>UUID: {service.id}</p>
    <p class="w-full xl:w-1/2">{service.description}</p>
  </div>
  <div class="max-w-fit rounded-lg border-2 border-secondary p-4">
    <h4>Handler</h4>
    <div class="flex gap-4">
      <div class="flex gap-1">Namespace <i>service-namespace</i></div>
      <div class="flex gap-1">Task Queue <i>service-task-queue</i></div>
    </div>
  </div>
  <h2 class="text-xl">Allowed Namespaces</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each namespaces as _namespace}
      <div>caller-namespace</div>
    {/each}
  </div>
</div>
