<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { endpointForm } from '$lib/pages/nexus-form.svelte';
  import { routeForNexus } from '$lib/utilities/route-for';

  import type { LayoutData } from '../$types';

  export let data: LayoutData;

  $: ({ endpoint } = data);

  const onSave = () => {
    console.log('$endpointForm: ', $endpointForm);
  };
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
        {endpoint.spec.name}
      </h1>
      <div class="flex items-center gap-2">
        <Button variant="destructive"
          >{translate('nexus.delete-endpoint')}</Button
        >
        <Button on:click={onSave}>{translate('common.save')}</Button>
      </div>
    </div>
  </div>
  <NexusForm endpoint={data.endpoint} />
  <div class="flex items-center gap-4">
    <Button on:click={onSave}>{translate('common.save')}</Button>
    <Button variant="ghost">{translate('common.cancel')}</Button>
  </div>
</div>
