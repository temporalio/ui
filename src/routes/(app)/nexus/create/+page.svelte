<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import NexusForm from '$lib/pages/nexus-form.svelte';
  import { routeForNexus } from '$lib/utilities/route-for';
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
  <NexusForm />
  <div class="flex items-center gap-4">
    <Button variant="primary">{translate('nexus.create-endpoint')}</Button>
    <Button variant="ghost">{translate('common.cancel')}</Button>
  </div>
</div>
