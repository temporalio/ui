<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm, { endpointForm } from '$lib/pages/nexus-form.svelte';
  import { createNexusEndpoint } from '$lib/services/nexus-service';
  import type { NetworkError } from '$lib/types/global';
  import { routeForNexus } from '$lib/utilities/route-for';

  let error: NetworkError | undefined = undefined;

  const onCreate = async () => {
    try {
      const body = { ...$endpointForm };
      delete body.spec.description;
      console.log('Endpoint body: ', body);
      await createNexusEndpoint(body);
      goto(routeForNexus());
    } catch (e) {
      error = e as NetworkError;
      console.error('Error creating endpoint', e);
    }
  };

  $: createDisabled =
    $endpointForm.spec.name === '' ||
    $endpointForm.spec.target.worker.namespace === '' ||
    $endpointForm.spec.target.worker.taskQueue === '';
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="flex w-full flex-col gap-8">
  <div class="text-sm">
    <Link href={routeForNexus()} icon="chevron-left">
      {translate('nexus.back-to-endpoints')}
    </Link>
  </div>
  <h1 data-testid="namespace-selector-title" class="text-2xl">
    {translate('nexus.create-endpoint')}
  </h1>
  <NexusForm {error} />
  <div class="flex items-center gap-4">
    <Button variant="primary" on:click={onCreate} disabled={createDisabled}
      >{translate('nexus.create-endpoint')}</Button
    >
    <Button variant="ghost" on:click={() => goto(routeForNexus())}
      >{translate('common.cancel')}</Button
    >
  </div>
</div>
