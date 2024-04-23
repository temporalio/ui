<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexusService } from '$lib/utilities/route-for';

  import services from '$fixtures/nexus-services.json';

  $: ({ id } = $page.params);

  $: service = services.find((service) => service.id === id);
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="flex flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexusService(service.id)} icon="chevron-left">
      {translate('namespaces.back-to-namespaces')}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title" class="text-2xl">
        {translate('nexus.import-service')}
      </h1>
    </div>
  </div>
  <div class="flex max-w-fit flex-col gap-4">
    <FilterSelect
      label={translate('nexus.service-name')}
      parameter="name"
      value="24 hours"
    >
      {#each services as service}
        <Option value={service.name}>{service.name}</Option>
      {/each}
    </FilterSelect>
  </div>
</div>
