<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexus } from '$lib/utilities/route-for';
</script>

<PageTitle title={translate('nexus.nexus')} url={$page.url.href} />
<div class="relative flex flex-col gap-4 text-sm">
  <Link href={routeForNexus()} icon="chevron-left">
    {translate('nexus.back-to-services')}
  </Link>
</div>
<h1 data-testid="namespace-selector-title" class="mb-8 text-2xl">
  {translate('nexus.create-service')}
</h1>
