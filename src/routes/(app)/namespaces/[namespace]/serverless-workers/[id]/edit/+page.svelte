<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import ServerlessWorkerEdit from '$lib/pages/serverless-worker-edit.svelte';
  import { routeForServerlessWorker } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const id = $derived(page.params.id);
</script>

<PageTitle
  title={translate('workers.edit-serverless-worker-title')}
  url={page.url.href}
/>

<header class="flex flex-col gap-2">
  <Link
    href={routeForServerlessWorker({ namespace, id })}
    data-testid="back-to-worker-detail"
    icon="chevron-left"
  >
    {translate('workers.back-to-worker')}
  </Link>
</header>

<ServerlessWorkerEdit {id} {namespace} />
