<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusService } from '$lib/types/nexus';
  import { routeForNexus } from '$lib/utilities/route-for';

  export let service: NexusService;
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
    </div>
    <p class="w-full xl:w-1/2">{service.description}</p>
  </div>
  <div class="max-w-fit rounded-lg border-2 border-secondary p-4">
    <div class="flex items-center">
      <Link href={$page.url.href}>link-to-service</Link>
    </div>
  </div>
</div>
