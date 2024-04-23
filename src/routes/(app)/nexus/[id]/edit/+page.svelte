<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexusService } from '$lib/utilities/route-for';

  import { services } from '../../services';

  $: ({ id } = $page.params);

  $: service = services.find((service) => service.id === id);
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="flex flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexusService(service.id)} icon="chevron-left">
      {translate('common.view')}
      {service.name}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title" class="text-2xl">
        {service.name}
      </h1>
    </div>
  </div>
</div>
