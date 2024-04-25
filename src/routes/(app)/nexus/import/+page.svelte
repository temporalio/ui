<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import ChipCombobox from '$lib/holocene/combobox/chip-combobox.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { namespaces } from '$lib/stores/namespaces';
  import type { NexusService } from '$lib/types/nexus';
  import { routeForNexus } from '$lib/utilities/route-for';

  import services from '$fixtures/nexus-services.json';
  import type { DescribeNamespaceResponse as Namespace } from '$types';

  $: serviceId = $page.url.searchParams.get('service') || '';
  let alias = '';
  let serviceNamespaces = $namespaces.map(
    (namespace: Namespace) => namespace?.namespaceInfo?.name,
  );
  let namespaceSearch = '';

  const handleServiceSelect = (event: CustomEvent<{ value: NexusService }>) => {
    serviceId = event.detail.value.id;
  };

  $: previewString = 'service.NewWorkflowRunOperation("' + alias + '")';
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="flex w-full flex-col gap-8">
  <div class="relative flex flex-col gap-4 text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-services')}
    </Link>
  </div>
  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h1 data-testid="namespace-selector-title" class="text-2xl">
        {translate('nexus.import-service')}
      </h1>
    </div>
  </div>
  <div class="flex w-full flex-col gap-4 xl:w-1/2">
    <Input
      bind:value={alias}
      label={translate('nexus.service-name')}
      id="service-name"
      maxLength={255}
      placeholder={translate('nexus.service-name')}
    />
    <Combobox
      required
      label={translate('nexus.service')}
      toggleLabel={translate('nexus.service-name')}
      noResultsText={translate('common.no-results')}
      value={serviceId}
      id="service-switcher"
      leadingIcon="nexus"
      options={services}
      optionValueKey="id"
      optionLabelKey="name"
      placeholder={translate('nexus.select-service')}
      on:change={handleServiceSelect}
      minSize={32}
    />
    <div>
      <p class="text-gray-500 text-sm font-medium">
        {translate('common.preview')}
      </p>
      <CodeBlock language="text" content={previewString} />
    </div>
    <ChipCombobox
      id="namespaces"
      placeholder="Select Namespaces for Service"
      value={namespaceSearch}
      chips={[]}
      label={translate('common.namespaces')}
      options={serviceNamespaces}
      maxSize={5}
    />
    <div class="flex items-center gap-4">
      <Button disabled={!serviceId} variant="primary"
        >{translate('nexus.import-service')}</Button
      >
      <Button variant="ghost" on:click={() => goto(routeForNexus())}
        >{translate('common.cancel')}</Button
      >
    </div>
  </div>
</div>
